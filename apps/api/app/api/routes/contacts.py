from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.contacts import (
    ContactCreateRequest,
    ContactNoteCreateRequest,
    ContactResponse,
    ContactUpdateRequest,
)
from app.services.crud_service import add_contact_note, create_contact, delete_contact, list_contacts, update_contact

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactResponse])
def get_contacts(
    context: CurrentContextDep,
    query: Annotated[str | None, Query()] = None,
    kind: Annotated[str | None, Query()] = None,
    status_value: Annotated[str | None, Query(alias="status")] = None,
    city: Annotated[str | None, Query()] = None,
    tag: Annotated[str | None, Query()] = None,
) -> list[dict]:
    contacts = list_contacts(
        context.membership.tenant_id,
        query=query,
        kind=kind,
        status_value=status_value,
        city=city,
        tag=tag,
    )
    return [to_dict(contact) for contact in contacts]


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def post_contact(payload: ContactCreateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    contact = create_contact(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        name=payload.name,
        kind=payload.kind,
        status=payload.status,
        email=payload.email,
        phone=payload.phone,
        city=payload.city,
        notes=payload.notes,
        tags=payload.tags,
    )
    return to_dict(contact)


@router.patch("/{contact_id}", response_model=ContactResponse)
def patch_contact(contact_id: str, payload: ContactUpdateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    contact = update_contact(
        context.membership.tenant_id,
        context.user.id,
        contact_id,
        payload.model_dump(exclude_none=True),
    )
    return to_dict(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_contact(contact_id: str, context: CurrentContextDep) -> None:
    require_min_role(context, {"owner", "admin", "coordinator"})
    delete_contact(context.membership.tenant_id, context.user.id, contact_id)


@router.post("/{contact_id}/notes", response_model=ContactResponse)
def post_contact_note(
    contact_id: str,
    payload: ContactNoteCreateRequest,
    context: CurrentContextDep,
) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    contact = add_contact_note(
        context.membership.tenant_id,
        context.user.id,
        contact_id,
        payload.content,
    )
    return to_dict(contact)
