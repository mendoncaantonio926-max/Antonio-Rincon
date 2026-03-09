from __future__ import annotations

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    tenant_name: str
    contacts_count: int
    priority_contacts_count: int
    leads_count: int
    converted_leads_count: int
    pending_leads_count: int
    hot_leads_count: int
    overdue_followups_count: int
    due_today_followups_count: int
    open_tasks_count: int
    overdue_tasks_count: int
    opponents_count: int
    reports_count: int
    memberships_count: int
    plan: str
    trial_status: str
    next_action: str
