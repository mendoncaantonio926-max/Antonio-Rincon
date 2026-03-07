from fastapi import APIRouter

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.audit import AuditLogResponse
from app.services.store import store

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditLogResponse])
def get_audit_logs(context: CurrentContextDep) -> list[dict]:
    require_min_role(context, {"owner", "admin"})
    logs = [
        log
        for log in store.audit_logs.values()
        if log.tenant_id == context.membership.tenant_id
    ]
    logs.sort(key=lambda item: item.created_at, reverse=True)
    return [to_dict(log) for log in logs]
