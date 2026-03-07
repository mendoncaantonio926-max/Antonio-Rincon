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
