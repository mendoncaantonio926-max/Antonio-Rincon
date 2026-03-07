from fastapi import APIRouter, status

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.onboarding import (
    CampaignCreateRequest,
    CampaignResponse,
    OnboardingStateResponse,
    OnboardingUpdateRequest,
)
from app.services.onboarding_service import (
    create_campaign,
    get_onboarding_state,
    list_campaigns,
    update_onboarding_state,
)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("", response_model=OnboardingStateResponse)
def get_state(context: CurrentContextDep) -> dict:
    return to_dict(get_onboarding_state(context.membership.tenant_id))


@router.patch("", response_model=OnboardingStateResponse)
def patch_state(payload: OnboardingUpdateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator"})
    state = update_onboarding_state(
        context.membership.tenant_id,
        context.user.id,
        payload.model_dump(exclude_none=True),
    )
    return to_dict(state)


@router.get("/campaigns", response_model=list[CampaignResponse])
def get_campaigns(context: CurrentContextDep) -> list[dict]:
    return [to_dict(campaign) for campaign in list_campaigns(context.membership.tenant_id)]


@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def post_campaign(payload: CampaignCreateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator"})
    campaign = create_campaign(
        context.membership.tenant_id,
        context.user.id,
        payload.name,
        payload.office,
        payload.city,
        payload.state,
        payload.phase,
    )
    return to_dict(campaign)
