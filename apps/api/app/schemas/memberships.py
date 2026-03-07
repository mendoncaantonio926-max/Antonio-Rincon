from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.domain.models import Role


class MembershipInviteRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=3, max_length=120)
    role: Role


class MembershipResponse(BaseModel):
    id: str
    user_id: str
    tenant_id: str
    role: Role
    email: str
    full_name: str
    created_at: str
