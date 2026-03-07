from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.models import Role


class TenantUpdateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)


class MembershipRoleUpdateRequest(BaseModel):
    role: Role
