from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.models import ContactKind, ContactStatus


class ContactCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    kind: ContactKind
    status: ContactStatus = "new"
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    notes: str | None = None
    tags: list[str] = Field(default_factory=list)


class ContactUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    kind: ContactKind | None = None
    status: ContactStatus | None = None
    email: str | None = None
    phone: str | None = None
    city: str | None = None
    notes: str | None = None
    tags: list[str] | None = None


class ContactNoteCreateRequest(BaseModel):
    content: str = Field(min_length=2, max_length=2000)


class ContactNoteResponse(BaseModel):
    id: str
    content: str
    created_at: str
    created_by: str


class ContactResponse(ContactCreateRequest):
    id: str
    tenant_id: str
    created_by: str
    note_history: list[ContactNoteResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str
