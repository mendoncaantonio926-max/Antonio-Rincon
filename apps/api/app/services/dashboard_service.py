from __future__ import annotations

from datetime import date

from app.services.crud_service import list_contacts, list_opponents, list_tasks
from app.services.plan_service import get_subscription_for_tenant
from app.services.report_service import list_reports
from app.services.store import store


def get_dashboard_summary(tenant_id: str) -> dict[str, str | int]:
    tenant = store.tenants[tenant_id]
    subscription = get_subscription_for_tenant(tenant_id)
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    reports = list_reports(tenant_id)
    leads = list(store.leads.values())
    memberships_count = len([membership for membership in store.memberships.values() if membership.tenant_id == tenant_id])
    today = date.today().isoformat()
    converted_leads_count = len([lead for lead in leads if lead.converted_contact_id])
    pending_leads_count = len(leads) - converted_leads_count
    overdue_followups_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at and lead.follow_up_at < today
        ]
    )
    due_today_followups_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at and lead.follow_up_at == today
        ]
    )
    hot_leads_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.stage in {"qualified", "follow_up", "proposal"}
        ]
    )
    overdue_tasks_count = 0

    for task in tasks:
        if task.status == "done" or not task.due_date:
            continue
        if task.due_date < today:
            overdue_tasks_count += 1

    if overdue_tasks_count > 0:
        next_action = "Priorize tarefas vencidas para recuperar o ritmo operacional."
    elif overdue_followups_count > 0:
        next_action = "Regularize follow-ups comerciais atrasados para proteger conversao."
    elif pending_leads_count > 0:
        next_action = "Converta os leads captados para nao perder janela comercial."
    elif len([contact for contact in contacts if contact.status == "priority"]) == 0 and contacts:
        next_action = "Classifique contatos prioritarios para orientar a coordenacao."
    elif not reports:
        next_action = "Gere um relatorio executivo para consolidar o momento da operacao."
    elif not opponents:
        next_action = "Cadastre o primeiro adversario para ativar monitoramento estrategico."
    else:
        next_action = "Workspace ativo. Mantenha contatos, tarefas e relatorios atualizados."

    return {
        "tenant_name": tenant.name,
        "contacts_count": len(contacts),
        "priority_contacts_count": len([contact for contact in contacts if contact.status == "priority"]),
        "leads_count": len(leads),
        "converted_leads_count": converted_leads_count,
        "pending_leads_count": pending_leads_count,
        "hot_leads_count": hot_leads_count,
        "overdue_followups_count": overdue_followups_count,
        "due_today_followups_count": due_today_followups_count,
        "open_tasks_count": len([task for task in tasks if task.status != "done"]),
        "overdue_tasks_count": overdue_tasks_count,
        "opponents_count": len(opponents),
        "reports_count": len(reports),
        "memberships_count": memberships_count,
        "plan": subscription.plan,
        "trial_status": subscription.status,
        "next_action": next_action,
    }
