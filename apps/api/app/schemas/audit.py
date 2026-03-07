from __future__ import annotations

from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: str
    tenant_id: str
    actor_user_id: str
    action: str
    resource_type: str
    resource_id: str
    metadata: dict = Field(default_factory=dict)
    created_at: str
