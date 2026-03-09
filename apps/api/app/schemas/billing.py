from __future__ import annotations

from pydantic import BaseModel

from app.domain.models import Plan


class SubscriptionResponse(BaseModel):
    id: str
    tenant_id: str
    plan: Plan
    status: str
    billing_cycle: str
    trial_ends_at: str | None = None
    current_period_ends_at: str | None = None
    cancel_at_period_end: bool
    grace_period_ends_at: str | None = None
    last_payment_attempt_at: str | None = None
    failed_payments_count: int
    grace_days_remaining: int
    trial_days_remaining: int
    seat_usage_count: int
    seat_usage_ratio: float
    seat_pressure: str
    seats_included: int
    ai_requests_limit: int
    report_exports_limit: int
    suggested_plan: Plan
    can_export_reports: bool
    commercial_status: str
    collection_stage: str
    renewal_risk: str
    commercial_motion: str
    recommended_billing_cycle: str
    next_commercial_action: str
    next_billing_at: str | None = None
    created_at: str
    updated_at: str


class CheckoutRequest(BaseModel):
    plan: Plan


class CheckoutResponse(BaseModel):
    checkout_url: str
    message: str


class PlanCatalogItemResponse(BaseModel):
    plan: Plan
    seats_included: int
    ai_requests_limit: int
    report_exports_limit: int
    recommended_for: str


class SubscriptionActionRequest(BaseModel):
    action: str


class SubscriptionActionResponse(BaseModel):
    message: str


class BillingEventResponse(BaseModel):
    id: str
    action: str
    title: str
    detail: str
    created_at: str
