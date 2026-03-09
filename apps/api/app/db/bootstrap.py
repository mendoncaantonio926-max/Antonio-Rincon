from sqlalchemy import inspect, text

from app.db.base import Base
from app.db.models import (  # noqa: F401
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
from app.db.session import engine


def create_all() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        inspector = inspect(connection)
        contact_columns = {column["name"] for column in inspector.get_columns("contacts")}
        if "status" not in contact_columns:
            connection.execute(text("ALTER TABLE contacts ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'new'"))
        report_columns = {column["name"] for column in inspector.get_columns("reports")}
        if "metrics" not in report_columns:
            connection.execute(text("ALTER TABLE reports ADD COLUMN metrics JSON"))
        opponent_columns = {column["name"] for column in inspector.get_columns("opponents")}
        if "stance" not in opponent_columns:
            connection.execute(text("ALTER TABLE opponents ADD COLUMN stance VARCHAR(32) NOT NULL DEFAULT 'challenger'"))
        if "watch_level" not in opponent_columns:
            connection.execute(text("ALTER TABLE opponents ADD COLUMN watch_level VARCHAR(32) NOT NULL DEFAULT 'attention'"))
        subscription_columns = {column["name"] for column in inspector.get_columns("subscriptions")}
        if "billing_cycle" not in subscription_columns:
            connection.execute(
                text("ALTER TABLE subscriptions ADD COLUMN billing_cycle VARCHAR(16) NOT NULL DEFAULT 'monthly'")
            )
        if "current_period_ends_at" not in subscription_columns:
            connection.execute(text("ALTER TABLE subscriptions ADD COLUMN current_period_ends_at VARCHAR(32)"))
        if "cancel_at_period_end" not in subscription_columns:
            connection.execute(
                text("ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT 0")
            )
        if "grace_period_ends_at" not in subscription_columns:
            connection.execute(text("ALTER TABLE subscriptions ADD COLUMN grace_period_ends_at VARCHAR(32)"))
        if "last_payment_attempt_at" not in subscription_columns:
            connection.execute(text("ALTER TABLE subscriptions ADD COLUMN last_payment_attempt_at VARCHAR(32)"))
        if "failed_payments_count" not in subscription_columns:
            connection.execute(
                text("ALTER TABLE subscriptions ADD COLUMN failed_payments_count INTEGER NOT NULL DEFAULT 0")
            )
        lead_columns = {column["name"] for column in inspector.get_columns("leads")}
        if "stage" not in lead_columns:
            connection.execute(text("ALTER TABLE leads ADD COLUMN stage VARCHAR(32) NOT NULL DEFAULT 'captured'"))
        if "owner_user_id" not in lead_columns:
            connection.execute(text("ALTER TABLE leads ADD COLUMN owner_user_id VARCHAR(36)"))
        if "follow_up_at" not in lead_columns:
            connection.execute(text("ALTER TABLE leads ADD COLUMN follow_up_at VARCHAR(32)"))
        if "converted_contact_id" not in lead_columns:
            connection.execute(text("ALTER TABLE leads ADD COLUMN converted_contact_id VARCHAR(36)"))
        if "converted_at" not in lead_columns:
            connection.execute(text("ALTER TABLE leads ADD COLUMN converted_at VARCHAR(32)"))
