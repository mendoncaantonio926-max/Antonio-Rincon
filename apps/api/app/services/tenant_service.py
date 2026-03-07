from __future__ import annotations

from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.domain.models import AuditLog
from app.services.store import store


def update_tenant_name(tenant_id: str, actor_user_id: str, name: str) -> dict:
    tenant = store.tenants.get(tenant_id)
    if tenant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant nao encontrado.")

    tenant.name = name
    if hasattr(tenant, "updated_at"):
        tenant.updated_at = datetime.now(UTC)
    store.tenants[tenant.id] = tenant
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="tenant.updated",
            resource_type="tenant",
            resource_id=tenant.id,
            metadata={"name": name},
        )
    )
    return {"id": tenant.id, "name": tenant.name}
