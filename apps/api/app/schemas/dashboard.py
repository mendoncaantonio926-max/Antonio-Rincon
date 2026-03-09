from __future__ import annotations

from pydantic import BaseModel


class DashboardQueueGroupResponse(BaseModel):
    label: str
    leads_count: int
    overdue_count: int
    due_today_count: int


class DashboardOwnerAlertResponse(BaseModel):
    owner_label: str
    severity: str
    summary: str


class DashboardExecutionItemResponse(BaseModel):
    lead_id: str
    lead_name: str
    owner_label: str
    follow_up_label: str
    risk_score: int


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
    critical_queue_count: int
    open_tasks_count: int
    overdue_tasks_count: int
    opponents_count: int
    reports_count: int
    memberships_count: int
    plan: str
    trial_status: str
    priority_lead_id: str | None = None
    priority_lead_name: str | None = None
    priority_lead_owner_user_id: str | None = None
    priority_lead_owner_name: str | None = None
    priority_lead_suggested_owner_user_id: str | None = None
    priority_lead_has_owner: bool
    priority_lead_follow_up_label: str | None = None
    priority_lead_risk_score: int
    commercial_owner_groups: list[DashboardQueueGroupResponse]
    commercial_window_groups: list[DashboardQueueGroupResponse]
    owner_alerts: list[DashboardOwnerAlertResponse]
    daily_execution_queue: list[DashboardExecutionItemResponse]
    next_action: str
