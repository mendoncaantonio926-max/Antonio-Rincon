from __future__ import annotations

from dataclasses import replace
from datetime import UTC, date, datetime, timedelta

from fastapi import HTTPException, status

from app.domain.models import AuditLog, LeadFormSubmission
from app.services.crud_service import create_contact
from app.services.store import store


def _lead_priority_label(risk_score: int) -> str:
    if risk_score >= 85:
        return "critical"
    if risk_score >= 65:
        return "high"
    if risk_score >= 40:
        return "normal"
    return "low"


def _lead_follow_up_bucket(lead: LeadFormSubmission) -> str:
    if lead.converted_contact_id:
        return "converted"
    if not lead.follow_up_at:
        return "unscheduled"

    today = date.today().isoformat()
    if lead.follow_up_at < today:
        return "overdue"
    if lead.follow_up_at == today:
        return "today"
    if lead.follow_up_at <= (date.today() + timedelta(days=7)).isoformat():
        return "this_week"
    return "later"


def _lead_risk_score(lead: LeadFormSubmission) -> int:
    score = {
        "captured": 26,
        "qualified": 58,
        "follow_up": 68,
        "proposal": 78,
        "converted": 14,
        "archived": 8,
    }.get(lead.stage, 20)
    follow_up_bucket = _lead_follow_up_bucket(lead)
    if follow_up_bucket == "overdue":
        score += 24
    elif follow_up_bucket == "today":
        score += 14
    elif follow_up_bucket == "this_week":
        score += 8
    if lead.phone:
        score += 8
    if lead.city:
        score += 4
    if lead.challenge:
        score += 6
    return min(score, 100)


def _suggested_owner(tenant_id: str | None) -> tuple[str | None, str | None]:
    if not tenant_id:
        return (None, None)

    priority_order = {"coordinator": 0, "admin": 1, "owner": 2, "analyst": 3, "viewer": 4}
    memberships = sorted(
        [item for item in store.memberships.values() if item.tenant_id == tenant_id],
        key=lambda item: (priority_order.get(item.role, 99), item.created_at.isoformat()),
    )
    if not memberships:
        return (None, None)
    suggested_membership = memberships[0]
    suggested_user = store.users.get(suggested_membership.user_id)
    return (
        suggested_membership.user_id,
        suggested_user.full_name if suggested_user else None,
    )


def serialize_lead(lead: LeadFormSubmission, tenant_id: str | None = None) -> dict:
    owner_name = None
    if lead.owner_user_id and lead.owner_user_id in store.users:
        owner_name = store.users[lead.owner_user_id].full_name
    suggested_owner_user_id, suggested_owner_name = _suggested_owner(tenant_id)
    risk_score = _lead_risk_score(lead)
    return {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "role": lead.role,
        "city": lead.city,
        "challenge": lead.challenge,
        "source": lead.source,
        "stage": lead.stage,
        "owner_user_id": lead.owner_user_id,
        "owner_name": owner_name,
        "follow_up_at": lead.follow_up_at,
        "risk_score": risk_score,
        "priority_label": _lead_priority_label(risk_score),
        "follow_up_bucket": _lead_follow_up_bucket(lead),
        "suggested_owner_user_id": None if lead.owner_user_id else suggested_owner_user_id,
        "suggested_owner_name": None if lead.owner_user_id else suggested_owner_name,
        "converted_contact_id": lead.converted_contact_id,
        "converted_at": lead.converted_at,
        "created_at": lead.created_at.isoformat(),
    }


def list_leads(
    *,
    query: str | None = None,
    stage: str | None = None,
    owner_user_id: str | None = None,
) -> list[LeadFormSubmission]:
    leads = list(store.leads.values())
    if query:
        normalized_query = query.lower()
        leads = [
            lead
            for lead in leads
            if normalized_query in lead.name.lower()
            or normalized_query in lead.email.lower()
            or normalized_query in (lead.phone or "").lower()
            or normalized_query in (lead.city or "").lower()
            or normalized_query in (lead.challenge or "").lower()
        ]
    if stage:
        leads = [lead for lead in leads if lead.stage == stage]
    if owner_user_id:
        leads = [lead for lead in leads if lead.owner_user_id == owner_user_id]
    bucket_order = {
        "overdue": 0,
        "today": 1,
        "this_week": 2,
        "later": 3,
        "unscheduled": 4,
        "converted": 5,
    }
    leads.sort(
        key=lambda item: (
            bucket_order.get(_lead_follow_up_bucket(item), 99),
            -_lead_risk_score(item),
            item.follow_up_at or "9999-12-31",
            item.created_at.isoformat(),
        )
    )
    return leads


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


def update_lead(
    *,
    tenant_id: str,
    user_id: str,
    lead_id: str,
    updates: dict[str, str | None],
) -> LeadFormSubmission:
    lead = store.leads.get(lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead nao encontrado.")

    owner_user_id = updates.get("owner_user_id", lead.owner_user_id)
    normalized_owner_user_id = owner_user_id or None
    normalized_follow_up_at = updates.get("follow_up_at", lead.follow_up_at) or None
    if normalized_owner_user_id:
        membership = next(
            (
                item
                for item in store.memberships.values()
                if item.tenant_id == tenant_id and item.user_id == normalized_owner_user_id
            ),
            None,
        )
        if membership is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Responsavel nao encontrado.")

    updated_lead = replace(
        lead,
        stage=updates.get("stage", lead.stage) or lead.stage,
        owner_user_id=normalized_owner_user_id,
        follow_up_at=normalized_follow_up_at,
    )
    store.leads[lead.id] = updated_lead
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="lead.updated",
            resource_type="lead",
            resource_id=lead.id,
            metadata={
                "stage": updated_lead.stage,
                "owner_user_id": updated_lead.owner_user_id,
                "follow_up_at": updated_lead.follow_up_at,
            },
        )
    )
    return updated_lead


def convert_lead_to_contact(*, tenant_id: str, user_id: str, lead_id: str) -> LeadFormSubmission:
    lead = store.leads.get(lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead nao encontrado.")
    if lead.converted_contact_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Lead ja convertido.")

    existing_contact = next(
        (
            contact
            for contact in store.contacts.values()
            if contact.tenant_id == tenant_id and (contact.email or "").lower() == lead.email.lower()
        ),
        None,
    )

    challenge_summary = (lead.challenge or "").strip()
    source_label = (lead.source or "website").strip()
    source_tag = source_label.lower().replace(" ", "_")
    note_parts = [f"Lead convertido da origem {source_label}."]
    if challenge_summary:
        note_parts.append(f"Desafio inicial: {challenge_summary}")
    lead_note = " ".join(note_parts)

    if existing_contact is None:
        contact = create_contact(
            tenant_id=tenant_id,
            user_id=user_id,
            name=lead.name,
            kind="lead",
            status="qualified",
            email=lead.email,
            phone=lead.phone,
            city=lead.city,
            notes=lead_note,
            tags=["lead_convertido", f"origem:{source_tag}"],
        )
    else:
        merged_tags = list(
            dict.fromkeys([*existing_contact.tags, "lead_convertido", f"origem:{source_tag}"])
        )
        merged_notes = existing_contact.notes or lead_note
        if existing_contact.notes and challenge_summary and challenge_summary not in existing_contact.notes:
            merged_notes = f"{existing_contact.notes}\n{lead_note}"
        updated_contact = replace(
            existing_contact,
            name=existing_contact.name or lead.name,
            status="qualified" if existing_contact.status == "new" else existing_contact.status,
            phone=existing_contact.phone or lead.phone,
            city=existing_contact.city or lead.city,
            notes=merged_notes,
            tags=merged_tags,
            updated_at=datetime.now(UTC),
        )
        store.contacts[updated_contact.id] = updated_contact
        store.log_action(
            AuditLog(
                tenant_id=tenant_id,
                actor_user_id=user_id,
                action="contact.updated_from_lead",
                resource_type="contact",
                resource_id=updated_contact.id,
                metadata={"lead_id": lead.id},
            )
        )
        contact = updated_contact

    converted_lead = replace(
        lead,
        stage="converted",
        converted_contact_id=contact.id,
        converted_at=datetime.now(UTC).isoformat(),
    )
    store.leads[lead.id] = converted_lead
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="lead.converted",
            resource_type="lead",
            resource_id=lead.id,
            metadata={"contact_id": contact.id},
        )
    )
    return converted_lead
