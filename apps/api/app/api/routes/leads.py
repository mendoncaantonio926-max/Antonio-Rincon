from fastapi import APIRouter

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.public import LeadResponse
from app.services.public_service import convert_lead_to_contact
from app.services.store import store

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=list[LeadResponse])
def get_leads(context: CurrentContextDep) -> list[dict]:
    require_min_role(context, {"owner", "admin", "coordinator"})
    leads = list(store.leads.values())
    leads.sort(key=lambda item: item.created_at, reverse=True)
    return [to_dict(lead) for lead in leads]


@router.post("/{lead_id}/convert", response_model=LeadResponse)
def post_convert_lead(lead_id: str, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    lead = convert_lead_to_contact(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        lead_id=lead_id,
    )
    return to_dict(lead)
