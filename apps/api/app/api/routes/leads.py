from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.schemas.public import LeadResponse, LeadUpdateRequest
from app.services.public_service import convert_lead_to_contact, list_leads, serialize_lead, update_lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=list[LeadResponse])
def get_leads(
    context: CurrentContextDep,
    query: Annotated[str | None, Query()] = None,
    stage: Annotated[str | None, Query()] = None,
    owner_user_id: Annotated[str | None, Query()] = None,
) -> list[dict]:
    require_min_role(context, {"owner", "admin", "coordinator"})
    leads = list_leads(query=query, stage=stage, owner_user_id=owner_user_id)
    return [serialize_lead(lead, context.membership.tenant_id) for lead in leads]


@router.patch("/{lead_id}", response_model=LeadResponse)
def patch_lead(lead_id: str, payload: LeadUpdateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    lead = update_lead(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        lead_id=lead_id,
        updates=payload.model_dump(exclude_unset=True),
    )
    return serialize_lead(lead, context.membership.tenant_id)


@router.post("/{lead_id}/convert", response_model=LeadResponse)
def post_convert_lead(lead_id: str, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    lead = convert_lead_to_contact(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        lead_id=lead_id,
    )
    return serialize_lead(lead, context.membership.tenant_id)
