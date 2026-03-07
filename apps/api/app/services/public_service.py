from __future__ import annotations

from app.domain.models import LeadFormSubmission
from app.services.store import store


def create_lead(
    *,
    name: str,
    email: str,
    phone: str | None,
    role: str | None,
    city: str | None,
    challenge: str | None,
    source: str,
) -> LeadFormSubmission:
    lead = LeadFormSubmission(
        name=name,
        email=email,
        phone=phone,
        role=role,
        city=city,
        challenge=challenge,
        source=source,
    )
    store.leads[lead.id] = lead
    store.save()
    return lead
