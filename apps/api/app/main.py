from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.ai import router as ai_router
from app.api.routes.audit import router as audit_router
from app.api.routes.auth import router as auth_router
from app.api.routes.billing import router as billing_router
from app.api.routes.contacts import router as contacts_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.health import router as health_router
from app.api.routes.leads import router as leads_router
from app.api.routes.memberships import router as memberships_router
from app.api.routes.onboarding import router as onboarding_router
from app.api.routes.opponents import router as opponents_router
from app.api.routes.public import router as public_router
from app.api.routes.reports import router as reports_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.tenants import router as tenants_router
from app.core.config import settings
from app.db.bootstrap import create_all


def create_app() -> FastAPI:
    create_all()
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:4173",
            "http://localhost:4173",
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(tenants_router)
    app.include_router(contacts_router)
    app.include_router(dashboard_router)
    app.include_router(tasks_router)
    app.include_router(opponents_router)
    app.include_router(audit_router)
    app.include_router(ai_router)
    app.include_router(onboarding_router)
    app.include_router(billing_router)
    app.include_router(reports_router)
    app.include_router(public_router)
    app.include_router(leads_router)
    app.include_router(memberships_router)
    return app


app = create_app()
