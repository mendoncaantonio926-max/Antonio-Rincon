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
    memberships_count = len([membership for membership in store.memberships.values() if membership.tenant_id == tenant_id])
    overdue_tasks_count = 0
    today = date.today().isoformat()

    for task in tasks:
        if task.status == "done" or not task.due_date:
            continue
        if task.due_date < today:
            overdue_tasks_count += 1

    if overdue_tasks_count > 0:
        next_action = "Priorize tarefas vencidas para recuperar o ritmo operacional."
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
        "open_tasks_count": len([task for task in tasks if task.status != "done"]),
        "overdue_tasks_count": overdue_tasks_count,
        "opponents_count": len(opponents),
        "reports_count": len(reports),
        "memberships_count": memberships_count,
        "plan": subscription.plan,
        "trial_status": subscription.status,
        "next_action": next_action,
    }
