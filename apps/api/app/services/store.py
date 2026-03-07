from __future__ import annotations

from dataclasses import fields
from datetime import UTC, datetime
from pathlib import Path
import sys
from typing import Any, TypeVar

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.bootstrap import create_all
from app.db.models import (
    AuditLogModel,
    CampaignModel,
    ContactModel,
    LeadModel,
    MembershipModel,
    OnboardingStateModel,
    OpponentEventModel,
    OpponentModel,
    ReportModel,
    SubscriptionModel,
    TaskModel,
    TenantModel,
    UserModel,
)
from app.db.session import SessionLocal
from app.domain.models import (
    AuditLog,
    Campaign,
    Contact,
    LeadFormSubmission,
    Membership,
    OnboardingState,
    Opponent,
    OpponentEvent,
    Report,
    Subscription,
    Task,
    Tenant,
    User,
)

T = TypeVar("T")


class SqlAlchemyStore:
    def __init__(self) -> None:
        self.data_path = self._resolve_data_path()
        self.data_path.parent.mkdir(parents=True, exist_ok=True)
        if "pytest" in sys.modules and self.data_path.exists():
            self.data_path.unlink()
        self.users: dict[str, User] = {}
        self.users_by_email: dict[str, str] = {}
        self.tenants: dict[str, Tenant] = {}
        self.memberships: dict[str, Membership] = {}
        self.memberships_by_user: dict[str, list[str]] = {}
        self.contacts: dict[str, Contact] = {}
        self.tasks: dict[str, Task] = {}
        self.opponents: dict[str, Opponent] = {}
        self.opponent_events: dict[str, OpponentEvent] = {}
        self.audit_logs: dict[str, AuditLog] = {}
        self.campaigns: dict[str, Campaign] = {}
        self.onboarding_states: dict[str, OnboardingState] = {}
        self.leads: dict[str, LeadFormSubmission] = {}
        self.subscriptions: dict[str, Subscription] = {}
        self.reports: dict[str, Report] = {}
        create_all()
        self._load()
        if not self.users:
            self._seed()
            self.save()

    def _resolve_data_path(self) -> Path:
        if settings.database_url.startswith("sqlite:///"):
            return Path(settings.database_url.removeprefix("sqlite:///"))
        return Path(__file__).resolve().parents[2] / ".localdata" / "pulso-politico.db"

    def _normalize_datetime(self, value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)

    def _from_model(self, domain_cls: type[T], model: Any) -> T:
        payload: dict[str, Any] = {}
        for field in fields(domain_cls):
            attribute_name = "metadata_json" if field.name == "metadata" else field.name
            value = getattr(model, attribute_name)
            if field.name in {"created_at", "updated_at"}:
                value = self._normalize_datetime(value)
            payload[field.name] = value
        return domain_cls(**payload)

    def _to_model(self, model_cls: type[Any], item: Any) -> Any:
        payload: dict[str, Any] = {}
        for field in fields(item):
            attribute_name = "metadata_json" if field.name == "metadata" else field.name
            payload[attribute_name] = getattr(item, field.name)
        return model_cls(**payload)

    def _load_model_map(self, session: Session, model_cls: type[Any], domain_cls: type[T]) -> dict[str, T]:
        items = session.query(model_cls).all()
        return {item.id: self._from_model(domain_cls, item) for item in items}

    def _refresh_indexes(self) -> None:
        self.users_by_email = {user.email.lower(): user.id for user in self.users.values()}
        self.memberships_by_user = {}
        for membership in self.memberships.values():
            self.memberships_by_user.setdefault(membership.user_id, []).append(membership.id)

    def _load(self) -> None:
        with SessionLocal() as session:
            self.users = self._load_model_map(session, UserModel, User)
            self.tenants = self._load_model_map(session, TenantModel, Tenant)
            self.memberships = self._load_model_map(session, MembershipModel, Membership)
            self.contacts = self._load_model_map(session, ContactModel, Contact)
            self.tasks = self._load_model_map(session, TaskModel, Task)
            self.opponents = self._load_model_map(session, OpponentModel, Opponent)
            self.opponent_events = self._load_model_map(session, OpponentEventModel, OpponentEvent)
            self.audit_logs = self._load_model_map(session, AuditLogModel, AuditLog)
            self.campaigns = self._load_model_map(session, CampaignModel, Campaign)
            self.onboarding_states = self._load_model_map(session, OnboardingStateModel, OnboardingState)
            self.leads = self._load_model_map(session, LeadModel, LeadFormSubmission)
            self.subscriptions = self._load_model_map(session, SubscriptionModel, Subscription)
            self.reports = self._load_model_map(session, ReportModel, Report)
        self._refresh_indexes()

    def _seed(self) -> None:
        tenant = Tenant(name="Workspace Demo")
        user = User(
            email="owner@pulso.local",
            full_name="Owner Demo",
            password_hash=hash_password("Admin1234"),
        )
        membership = Membership(user_id=user.id, tenant_id=tenant.id, role="owner")
        onboarding = OnboardingState(tenant_id=tenant.id)
        subscription = Subscription(
            tenant_id=tenant.id,
            plan="executive",
            status="trialing",
            trial_ends_at="2026-03-20",
            seats_included=10,
            ai_requests_limit=300,
            report_exports_limit=100,
        )
        self.tenants[tenant.id] = tenant
        self.users[user.id] = user
        self.memberships[membership.id] = membership
        self.onboarding_states[onboarding.id] = onboarding
        self.subscriptions[subscription.id] = subscription
        self._refresh_indexes()
        self.audit_logs = {}
        self.log_action(
            AuditLog(
                tenant_id=tenant.id,
                actor_user_id=user.id,
                action="seed.created",
                resource_type="tenant",
                resource_id=tenant.id,
                metadata={"source": "system"},
            )
        )

    def save(self) -> None:
        with SessionLocal() as session:
            session.query(OpponentEventModel).delete()
            session.query(AuditLogModel).delete()
            session.query(ReportModel).delete()
            session.query(ContactModel).delete()
            session.query(TaskModel).delete()
            session.query(OpponentModel).delete()
            session.query(CampaignModel).delete()
            session.query(OnboardingStateModel).delete()
            session.query(LeadModel).delete()
            session.query(SubscriptionModel).delete()
            session.query(MembershipModel).delete()
            session.query(UserModel).delete()
            session.query(TenantModel).delete()

            session.add_all(self._to_model(TenantModel, item) for item in self.tenants.values())
            session.add_all(self._to_model(UserModel, item) for item in self.users.values())
            session.add_all(self._to_model(MembershipModel, item) for item in self.memberships.values())
            session.add_all(self._to_model(ContactModel, item) for item in self.contacts.values())
            session.add_all(self._to_model(TaskModel, item) for item in self.tasks.values())
            session.add_all(self._to_model(OpponentModel, item) for item in self.opponents.values())
            session.add_all(
                self._to_model(OpponentEventModel, item) for item in self.opponent_events.values()
            )
            session.add_all(self._to_model(AuditLogModel, item) for item in self.audit_logs.values())
            session.add_all(self._to_model(CampaignModel, item) for item in self.campaigns.values())
            session.add_all(
                self._to_model(OnboardingStateModel, item) for item in self.onboarding_states.values()
            )
            session.add_all(self._to_model(LeadModel, item) for item in self.leads.values())
            session.add_all(
                self._to_model(SubscriptionModel, item) for item in self.subscriptions.values()
            )
            session.add_all(self._to_model(ReportModel, item) for item in self.reports.values())
            session.commit()
        self._refresh_indexes()

    def log_action(self, audit_log: AuditLog) -> None:
        self.audit_logs[audit_log.id] = audit_log
        self.save()


store = SqlAlchemyStore()
