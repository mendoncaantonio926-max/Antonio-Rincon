from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def generate_id() -> str:
    return str(uuid4())


json_type = JSON().with_variant(JSONB, "postgresql")


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class TenantModel(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    memberships: Mapped[list["MembershipModel"]] = relationship(back_populates="tenant")


class UserModel(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    memberships: Mapped[list["MembershipModel"]] = relationship(back_populates="user")


class MembershipModel(Base, TimestampMixin):
    __tablename__ = "memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(32), nullable=False)

    user: Mapped[UserModel] = relationship(back_populates="memberships")
    tenant: Mapped[TenantModel] = relationship(back_populates="memberships")


class CampaignModel(Base, TimestampMixin):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    office: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120))
    state: Mapped[str | None] = mapped_column(String(32))
    phase: Mapped[str] = mapped_column(String(32), nullable=False, default="pre_campaign")
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)


class ContactModel(Base, TimestampMixin):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="new")
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(64))
    city: Mapped[str | None] = mapped_column(String(120))
    notes: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(json_type, default=list)
    note_history: Mapped[list[dict]] = mapped_column(json_type, default=list)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)


class TaskModel(Base, TimestampMixin):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    priority: Mapped[str] = mapped_column(String(32), nullable=False)
    assignee_name: Mapped[str | None] = mapped_column(String(120))
    due_date: Mapped[str | None] = mapped_column(String(32))
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)


class OpponentModel(Base, TimestampMixin):
    __tablename__ = "opponents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    context: Mapped[str] = mapped_column(String(160), nullable=False)
    stance: Mapped[str] = mapped_column(String(32), nullable=False, default="challenger")
    watch_level: Mapped[str] = mapped_column(String(32), nullable=False, default="attention")
    links: Mapped[list[str]] = mapped_column(json_type, default=list)
    notes: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(json_type, default=list)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)


class OpponentEventModel(Base):
    __tablename__ = "opponent_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    opponent_id: Mapped[str] = mapped_column(ForeignKey("opponents.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False, default="info")
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SubscriptionModel(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    plan: Mapped[str] = mapped_column(String(32), nullable=False, default="essential")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="trialing")
    billing_cycle: Mapped[str] = mapped_column(String(16), nullable=False, default="monthly")
    trial_ends_at: Mapped[str | None] = mapped_column(String(32))
    current_period_ends_at: Mapped[str | None] = mapped_column(String(32))
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    grace_period_ends_at: Mapped[str | None] = mapped_column(String(32))
    last_payment_attempt_at: Mapped[str | None] = mapped_column(String(32))
    failed_payments_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    seats_included: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    ai_requests_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    report_exports_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=10)


class ReportModel(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    report_type: Mapped[str] = mapped_column(String(32), nullable=False)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    metrics: Mapped[dict] = mapped_column(json_type, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LeadModel(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(64))
    role: Mapped[str | None] = mapped_column(String(64))
    city: Mapped[str | None] = mapped_column(String(120))
    challenge: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="website")
    converted_contact_id: Mapped[str | None] = mapped_column(String(36))
    converted_at: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OnboardingStateModel(Base, TimestampMixin):
    __tablename__ = "onboarding_states"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    profile_type: Mapped[str | None] = mapped_column(String(64))
    objective: Mapped[str | None] = mapped_column(String(255))
    campaign_id: Mapped[str | None] = mapped_column(String(36))
    team_configured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    first_opponent_created: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    actor_user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(36), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", json_type, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
