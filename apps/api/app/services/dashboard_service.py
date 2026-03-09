from __future__ import annotations

from datetime import date

from app.services.public_service import serialize_lead
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
    pending_leads = [
        serialize_lead(lead, tenant_id) for lead in leads if not lead.converted_contact_id
    ]
    bucket_order = {
        "overdue": 0,
        "today": 1,
        "this_week": 2,
        "later": 3,
        "unscheduled": 4,
    }
    pending_leads.sort(
        key=lambda item: (
            bucket_order.get(str(item["follow_up_bucket"]), 99),
            -int(item["risk_score"]),
            str(item["follow_up_at"] or "9999-12-31"),
            str(item["created_at"]),
        )
    )
    priority_lead = pending_leads[0] if pending_leads else None
    critical_queue_count = len(
        [item for item in pending_leads if item["priority_label"] in {"high", "critical"}]
    )
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

    follow_up_bucket_labels = {
        "overdue": "Atrasado",
        "today": "Hoje",
        "this_week": "Esta semana",
        "later": "Mais a frente",
        "unscheduled": "Sem agenda",
    }
    owner_groups: dict[str, dict[str, str | int]] = {}
    for item in pending_leads:
        owner_label = str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner")
        group = owner_groups.setdefault(
            owner_label,
            {
                "label": owner_label,
                "leads_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if item["follow_up_bucket"] == "overdue":
            group["overdue_count"] = int(group["overdue_count"]) + 1
        if item["follow_up_bucket"] == "today":
            group["due_today_count"] = int(group["due_today_count"]) + 1

    window_groups: dict[str, dict[str, str | int]] = {}
    for item in pending_leads:
        window_label = follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda")
        group = window_groups.setdefault(
            window_label,
            {
                "label": window_label,
                "leads_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if item["follow_up_bucket"] == "overdue":
            group["overdue_count"] = int(group["overdue_count"]) + 1
        if item["follow_up_bucket"] == "today":
            group["due_today_count"] = int(group["due_today_count"]) + 1

    commercial_owner_groups = sorted(
        owner_groups.values(),
        key=lambda item: (-int(item["overdue_count"]), -int(item["leads_count"]), str(item["label"])),
    )
    commercial_window_groups = sorted(
        window_groups.values(),
        key=lambda item: (-int(item["overdue_count"]), -int(item["due_today_count"]), -int(item["leads_count"])),
    )
    owner_alerts = []
    for group in commercial_owner_groups:
        severity = "normal"
        if int(group["overdue_count"]) > 0:
            severity = "critical"
        elif int(group["due_today_count"]) > 0:
            severity = "attention"
        if int(group["leads_count"]) >= 3 and severity == "normal":
            severity = "attention"
        owner_alerts.append(
            {
                "owner_label": str(group["label"]),
                "severity": severity,
                "summary": (
                    f"{group['label']}: {group['leads_count']} lead(s), "
                    f"{group['overdue_count']} atrasado(s), {group['due_today_count']} para hoje."
                ),
            }
        )
    daily_execution_queue = [
        {
            "lead_id": str(item["id"]),
            "lead_name": str(item["name"]),
            "owner_label": str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner"),
            "follow_up_label": follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda"),
            "risk_score": int(item["risk_score"]),
        }
        for item in pending_leads[:5]
    ]

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
        "critical_queue_count": critical_queue_count,
        "open_tasks_count": len([task for task in tasks if task.status != "done"]),
        "overdue_tasks_count": overdue_tasks_count,
        "opponents_count": len(opponents),
        "reports_count": len(reports),
        "memberships_count": memberships_count,
        "plan": subscription.plan,
        "trial_status": subscription.status,
        "priority_lead_id": str(priority_lead["id"]) if priority_lead else None,
        "priority_lead_name": str(priority_lead["name"]) if priority_lead else None,
        "priority_lead_owner_user_id": (
            str(priority_lead["owner_user_id"]) if priority_lead and priority_lead["owner_user_id"] else None
        ),
        "priority_lead_owner_name": (
            str(priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
            if priority_lead
            else None
        ),
        "priority_lead_suggested_owner_user_id": (
            str(priority_lead["suggested_owner_user_id"])
            if priority_lead and priority_lead["suggested_owner_user_id"]
            else None
        ),
        "priority_lead_has_owner": bool(priority_lead["owner_user_id"]) if priority_lead else False,
        "priority_lead_follow_up_label": (
            follow_up_bucket_labels.get(str(priority_lead["follow_up_bucket"]), "Sem agenda")
            if priority_lead
            else None
        ),
        "priority_lead_risk_score": int(priority_lead["risk_score"]) if priority_lead else 0,
        "commercial_owner_groups": commercial_owner_groups[:4],
        "commercial_window_groups": commercial_window_groups[:5],
        "owner_alerts": owner_alerts[:4],
        "daily_execution_queue": daily_execution_queue,
        "next_action": next_action,
    }
