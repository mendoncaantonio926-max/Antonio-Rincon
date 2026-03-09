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


class DashboardProductivityResponse(BaseModel):
    label: str
    pending_count: int
    converted_count: int
    overdue_count: int
    due_today_count: int


class DashboardOwnerBriefResponse(BaseModel):
    owner_label: str
    first_action: str
    brief: str


class DashboardOwnerTargetResponse(BaseModel):
    owner_label: str
    target_conversions: int
    actual_conversions: int
    gap: int
    status: str


class DashboardThroughputComparisonResponse(BaseModel):
    current_window_label: str
    current_window_count: int
    previous_window_label: str
    previous_window_count: int
    delta: int
    direction: str
    summary: str


class DashboardOwnerThroughputResponse(BaseModel):
    owner_label: str
    current_window_count: int
    previous_window_count: int
    delta: int
    direction: str


class DashboardOwnerHealthResponse(BaseModel):
    owner_label: str
    health_score: int
    pressure_label: str
    overdue_count: int
    target_gap: int
    throughput_delta: int


class DashboardRecoveryItemResponse(BaseModel):
    lead_id: str
    lead_name: str
    owner_label: str
    reason: str
    recommended_action: str


class DashboardWindowPressureResponse(BaseModel):
    window_label: str
    leads_count: int
    high_risk_count: int
    owners_involved: int
    pressure_label: str


class DashboardRebalanceSuggestionResponse(BaseModel):
    from_owner_label: str
    to_owner_label: str
    lead_name: str
    reason: str


class DashboardOwnerCapacityResponse(BaseModel):
    owner_label: str
    active_queue_count: int
    overdue_count: int
    due_today_count: int
    available_capacity: int
    load_label: str
    recommended_window: str


class DashboardAssignmentSuggestionResponse(BaseModel):
    lead_name: str
    from_owner_label: str
    to_owner_label: str
    recommended_window: str
    reason: str


class DashboardOwnerPlanResponse(BaseModel):
    owner_label: str
    focus_today: str
    queue_size: int
    next_window: str
    priority_reason: str


class DashboardWindowPlanResponse(BaseModel):
    window_label: str
    focus_count: int
    primary_owner_label: str
    plan_summary: str


class DashboardStageForecastResponse(BaseModel):
    stage_label: str
    leads_count: int
    high_priority_count: int
    expected_conversions: int


class DashboardConversionForecastResponse(BaseModel):
    window_label: str
    expected_conversions: int
    committed_pipeline_count: int
    forecast_band: str
    summary: str


class DashboardOwnerStageMixResponse(BaseModel):
    owner_label: str
    captured_count: int
    qualified_count: int
    follow_up_count: int
    proposal_count: int


class DashboardForecastConfidenceResponse(BaseModel):
    score: int
    label: str
    committed_pipeline_count: int
    proposal_count: int
    overdue_risk_count: int
    summary: str


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
    owner_productivity: list[DashboardProductivityResponse]
    window_productivity: list[DashboardProductivityResponse]
    owner_targets: list[DashboardOwnerTargetResponse]
    throughput_comparison: DashboardThroughputComparisonResponse
    owner_throughput: list[DashboardOwnerThroughputResponse]
    owner_health: list[DashboardOwnerHealthResponse]
    recovery_queue: list[DashboardRecoveryItemResponse]
    window_pressure: list[DashboardWindowPressureResponse]
    rebalance_suggestions: list[DashboardRebalanceSuggestionResponse]
    owner_capacity: list[DashboardOwnerCapacityResponse]
    assignment_suggestions: list[DashboardAssignmentSuggestionResponse]
    owner_daily_plan: list[DashboardOwnerPlanResponse]
    window_allocation_plan: list[DashboardWindowPlanResponse]
    stage_forecast: list[DashboardStageForecastResponse]
    conversion_forecast: DashboardConversionForecastResponse
    owner_stage_mix: list[DashboardOwnerStageMixResponse]
    forecast_confidence: DashboardForecastConfidenceResponse
    morning_focus_summary: str
    owner_daily_briefs: list[DashboardOwnerBriefResponse]
    next_action: str
