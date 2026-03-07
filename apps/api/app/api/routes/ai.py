from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentContextDep
from app.schemas.ai import AiSummaryResponse
from app.services.ai_service import get_ai_summary

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/summary", response_model=AiSummaryResponse)
def summary(
    context: CurrentContextDep,
    module: Annotated[str, Query()] = "dashboard",
) -> AiSummaryResponse:
    return AiSummaryResponse(**get_ai_summary(context.membership.tenant_id, module=module))
