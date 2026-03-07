from fastapi import APIRouter, status

from app.domain.models import to_dict
from app.schemas.public import LeadCreateRequest, LeadResponse
from app.services.public_service import create_lead

router = APIRouter(prefix="/public", tags=["public"])


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def post_lead(payload: LeadCreateRequest) -> dict:
    lead = create_lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        city=payload.city,
        challenge=payload.challenge,
        source=payload.source,
    )
    return to_dict(lead)
