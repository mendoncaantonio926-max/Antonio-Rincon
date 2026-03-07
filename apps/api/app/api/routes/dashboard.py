from fastapi import APIRouter

from app.api.deps import CurrentContextDep
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def summary(context: CurrentContextDep) -> DashboardSummaryResponse:
    return DashboardSummaryResponse(**get_dashboard_summary(context.membership.tenant_id))
