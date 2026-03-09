from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import uuid4

Role = Literal["owner", "admin", "coordinator", "analyst", "viewer"]
TaskStatus = Literal["backlog", "in_progress", "waiting_review", "done"]
TaskPriority = Literal["low", "medium", "high", "urgent"]
ContactKind = Literal["supporter", "leadership", "supplier", "press", "partner", "lead"]
ContactStatus = Literal["new", "contacted", "qualified", "priority", "inactive"]
Plan = Literal["essential", "pro", "executive", "enterprise"]


def generate_id() -> str:
    return str(uuid4())


@dataclass
class Tenant:
    name: str
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class User:
    email: str
    full_name: str
    password_hash: str
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Membership:
    user_id: str
    tenant_id: str
    role: Role
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Contact:
    tenant_id: str
    name: str
    kind: ContactKind
    status: ContactStatus = "new"
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    notes: str | None = None
    tags: list[str] = field(default_factory=list)
    note_history: list[dict[str, str]] = field(default_factory=list)
    created_by: str = ""
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Task:
    tenant_id: str
    title: str
    status: TaskStatus
    priority: TaskPriority
    created_by: str
    description: str | None = None
    assignee_name: str | None = None
    due_date: str | None = None
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Opponent:
    tenant_id: str
    name: str
    context: str
    stance: Literal["incumbent", "challenger", "ally_risk", "local_force"] = "challenger"
    watch_level: Literal["observe", "attention", "critical"] = "attention"
    links: list[str] = field(default_factory=list)
    notes: str | None = None
    tags: list[str] = field(default_factory=list)
    created_by: str = ""
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class OpponentEvent:
    tenant_id: str
    opponent_id: str
    title: str
    description: str
    event_date: str
    severity: Literal["info", "warning", "critical"] = "info"
    created_by: str = ""
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class AuditLog:
    tenant_id: str
    actor_user_id: str
    action: str
    resource_type: str
    resource_id: str
    metadata: dict[str, Any] = field(default_factory=dict)
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Campaign:
    tenant_id: str
    name: str
    office: str
    city: str | None = None
    state: str | None = None
    phase: str = "pre_campaign"
    created_by: str = ""
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class OnboardingState:
    tenant_id: str
    profile_type: str | None = None
    objective: str | None = None
    campaign_id: str | None = None
    team_configured: bool = False
    first_opponent_created: bool = False
    completed: bool = False
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class LeadFormSubmission:
    name: str
    email: str
    phone: str | None = None
    role: str | None = None
    city: str | None = None
    challenge: str | None = None
    source: str = "website"
    stage: str = "captured"
    owner_user_id: str | None = None
    follow_up_at: str | None = None
    converted_contact_id: str | None = None
    converted_at: str | None = None
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Subscription:
    tenant_id: str
    plan: Plan = "essential"
    status: Literal["trialing", "active", "past_due", "canceled"] = "trialing"
    billing_cycle: Literal["monthly", "annual"] = "monthly"
    trial_ends_at: str | None = None
    current_period_ends_at: str | None = None
    cancel_at_period_end: bool = False
    grace_period_ends_at: str | None = None
    last_payment_attempt_at: str | None = None
    failed_payments_count: int = 0
    seats_included: int = 1
    ai_requests_limit: int = 50
    report_exports_limit: int = 10
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class Report:
    tenant_id: str
    title: str
    report_type: Literal["executive", "operational", "comparative", "opponents", "ai_summary"]
    created_by: str
    summary: str
    metrics: dict[str, int] = field(default_factory=dict)
    id: str = field(default_factory=generate_id)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


def to_dict(instance: Any) -> dict[str, Any]:
    payload = asdict(instance)
    for key, value in payload.items():
        if isinstance(value, datetime):
            payload[key] = value.isoformat()
    return payload
