from fastapi import APIRouter

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.schemas.settings import TenantUpdateRequest
from app.schemas.tenant import CurrentTenantResponse, TenantSummary
from app.services.tenant_service import update_tenant_name
from app.services.store import store

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/current", response_model=CurrentTenantResponse)
def get_current_tenant(context: CurrentContextDep) -> CurrentTenantResponse:
    tenant = store.tenants[context.membership.tenant_id]
    return CurrentTenantResponse(
        tenant=TenantSummary(id=tenant.id, name=tenant.name),
        role=context.membership.role,
    )


@router.patch("/current", response_model=TenantSummary)
def patch_current_tenant(payload: TenantUpdateRequest, context: CurrentContextDep) -> TenantSummary:
    require_min_role(context, {"owner", "admin"})
    updated = update_tenant_name(context.membership.tenant_id, context.user.id, payload.name)
    return TenantSummary(**updated)
