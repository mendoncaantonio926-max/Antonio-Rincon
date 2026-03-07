from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
import jwt

from app.core.security import decode_token
from app.domain.models import Membership, User
from app.services.store import store


class CurrentContext:
    def __init__(self, *, user: User, membership: Membership) -> None:
        self.user = user
        self.membership = membership


def get_current_context(authorization: Annotated[str | None, Header()] = None) -> CurrentContext:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente.",
        )

    token = authorization.replace("Bearer ", "", 1)
    try:
        payload = decode_token(token)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido ou expirado.",
        ) from exc
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido.",
        )

    user_id = str(payload.get("sub"))
    tenant_id = str(payload.get("tenant_id"))
    user = store.users.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario invalido.")

    membership = next(
        (
            membership
            for membership_id in store.memberships_by_user.get(user_id, [])
            if (membership := store.memberships[membership_id]).tenant_id == tenant_id
        ),
        None,
    )
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Membership invalida para o tenant informado.",
        )

    return CurrentContext(user=user, membership=membership)


CurrentContextDep = Annotated[CurrentContext, Depends(get_current_context)]
