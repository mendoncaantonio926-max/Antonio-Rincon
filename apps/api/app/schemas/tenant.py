from __future__ import annotations

from pydantic import BaseModel

from app.domain.models import Role


class TenantSummary(BaseModel):
    id: str
    name: str


class CurrentTenantResponse(BaseModel):
    tenant: TenantSummary
    role: Role
