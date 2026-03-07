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
    created_at: str
