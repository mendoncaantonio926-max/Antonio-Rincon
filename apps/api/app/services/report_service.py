from __future__ import annotations

from datetime import date

from app.domain.models import AuditLog, Report
from app.services.crud_service import list_contacts, list_opponent_events, list_opponents, list_tasks
from app.services.plan_service import consume_report_export
from app.services.store import store


def build_report_metrics(tenant_id: str) -> dict[str, int]:
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    opponent_events = sum(len(list_opponent_events(tenant_id, opponent.id)) for opponent in opponents)
    overdue_tasks = 0
    today = date.today().isoformat()

    for task in tasks:
        if task.status == "done" or not task.due_date:
            continue
        if task.due_date < today:
            overdue_tasks += 1

    return {
        "contacts_count": len(contacts),
        "priority_contacts_count": len([contact for contact in contacts if contact.status == "priority"]),
        "open_tasks_count": len([task for task in tasks if task.status != "done"]),
        "overdue_tasks_count": overdue_tasks,
        "opponents_count": len(opponents),
        "opponent_events_count": opponent_events,
    }


def build_report_summary(report_type: str, metrics: dict[str, int]) -> str:
    return (
        f"Resumo {report_type}: {metrics['contacts_count']} contatos, "
        f"{metrics['priority_contacts_count']} prioritario(s), "
        f"{metrics['open_tasks_count']} tarefas abertas, "
        f"{metrics['overdue_tasks_count']} vencida(s), "
        f"{metrics['opponents_count']} adversarios monitorados e "
        f"{metrics['opponent_events_count']} eventos registrados."
    )


def create_report(tenant_id: str, actor_user_id: str, title: str, report_type: str) -> Report:
    metrics = build_report_metrics(tenant_id)
    report = Report(
        tenant_id=tenant_id,
        title=title,
        report_type=report_type,
        created_by=actor_user_id,
        summary=build_report_summary(report_type, metrics),
        metrics=metrics,
    )
    store.reports[report.id] = report
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="report.created",
            resource_type="report",
            resource_id=report.id,
            metadata={"report_type": report_type},
        )
    )
    return report


def list_reports(tenant_id: str, report_type: str | None = None) -> list[Report]:
    reports = [report for report in store.reports.values() if report.tenant_id == tenant_id]
    if report_type:
        reports = [report for report in reports if report.report_type == report_type]
    reports.sort(key=lambda item: item.created_at, reverse=True)
    return reports


def export_report(tenant_id: str, actor_user_id: str, report_id: str, export_format: str) -> dict[str, str]:
    report = next(
        (item for item in store.reports.values() if item.id == report_id and item.tenant_id == tenant_id),
        None,
    )
    if report is None:
        raise ValueError("Relatorio nao encontrado.")
    consume_report_export(tenant_id)
    watermark = f"tenant={tenant_id} user={actor_user_id} report={report_id}"
    if export_format == "csv":
        content = (
            "title,report_type,contacts_count,priority_contacts_count,open_tasks_count,"
            "overdue_tasks_count,opponents_count,opponent_events_count,watermark\n"
            f"\"{report.title}\",{report.report_type},{report.metrics.get('contacts_count', 0)},"
            f"{report.metrics.get('priority_contacts_count', 0)},{report.metrics.get('open_tasks_count', 0)},"
            f"{report.metrics.get('overdue_tasks_count', 0)},{report.metrics.get('opponents_count', 0)},"
            f"{report.metrics.get('opponent_events_count', 0)},\"{watermark}\"\n"
        )
    else:
        content = (
            f"Pulso Politico - {report.title}\n"
            f"Tipo: {report.report_type}\n"
            f"Resumo: {report.summary}\n"
            f"Contatos prioritarios: {report.metrics.get('priority_contacts_count', 0)}\n"
            f"Tarefas vencidas: {report.metrics.get('overdue_tasks_count', 0)}\n"
            f"Watermark: {watermark}\n"
        )
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action=f"report.exported.{export_format}",
            resource_type="report",
            resource_id=report.id,
        )
    )
    extension = "pdf" if export_format == "pdf" else "csv"
    return {
        "filename": f"{report.title.lower().replace(' ', '-')}.{extension}",
        "content": content,
        "watermark": watermark,
    }
