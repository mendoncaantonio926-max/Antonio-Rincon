from __future__ import annotations

from fastapi import HTTPException, status

from app.api.deps import CurrentContext


def require_min_role(context: CurrentContext, allowed_roles: set[str]) -> None:
    if context.membership.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissao insuficiente.",
        )
