from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LeadCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = None
    role: str | None = None
    city: str | None = None
    challenge: str | None = None
    source: str = "website"


class LeadResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    role: str | None = None
    city: str | None = None
    challenge: str | None = None
    source: str
    stage: str
    owner_user_id: str | None = None
    owner_name: str | None = None
    follow_up_at: str | None = None
    converted_contact_id: str | None = None
    converted_at: str | None = None
    created_at: str


class LeadUpdateRequest(BaseModel):
    stage: str | None = None
    owner_user_id: str | None = None
    follow_up_at: str | None = None
