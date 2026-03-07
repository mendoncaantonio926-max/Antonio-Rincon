from __future__ import annotations

import secrets

from fastapi import HTTPException, status

from app.core.security import hash_password
from app.domain.models import AuditLog, Membership, User
from app.services.onboarding_service import update_onboarding_state
from app.services.plan_service import get_subscription_for_tenant
from app.services.store import store


def list_memberships(tenant_id: str) -> list[dict]:
    memberships = [membership for membership in store.memberships.values() if membership.tenant_id == tenant_id]
    response = []
    for membership in memberships:
        user = store.users[membership.user_id]
        response.append(
            {
                "id": membership.id,
                "user_id": membership.user_id,
                "tenant_id": membership.tenant_id,
                "role": membership.role,
                "email": user.email,
                "full_name": user.full_name,
                "created_at": membership.created_at.isoformat(),
            }
        )
    return response


def invite_member(
    *,
    tenant_id: str,
    actor_user_id: str,
    email: str,
    full_name: str,
    role: str,
) -> dict:
    subscription = get_subscription_for_tenant(tenant_id)
    current_seats = len([membership for membership in store.memberships.values() if membership.tenant_id == tenant_id])
    if current_seats >= subscription.seats_included:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Limite de usuarios do plano atingido.",
        )

    normalized_email = email.lower()
    user_id = store.users_by_email.get(normalized_email)
    if user_id:
        user = store.users[user_id]
        existing = next(
            (
                membership
                for membership in store.memberships.values()
                if membership.user_id == user.id and membership.tenant_id == tenant_id
            ),
            None,
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario ja pertence ao tenant.")
    else:
        user = User(
            email=normalized_email,
            full_name=full_name,
            password_hash=hash_password(secrets.token_urlsafe(16)),
        )
        store.users[user.id] = user
        store.users_by_email[normalized_email] = user.id

    membership = Membership(user_id=user.id, tenant_id=tenant_id, role=role)
    store.memberships[membership.id] = membership
    store.memberships_by_user.setdefault(user.id, []).append(membership.id)
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="membership.invited",
            resource_type="membership",
            resource_id=membership.id,
            metadata={"email": normalized_email, "role": role},
        )
    )
    update_onboarding_state(tenant_id, actor_user_id, {"team_configured": True})
    return {
        "id": membership.id,
        "user_id": membership.user_id,
        "tenant_id": membership.tenant_id,
        "role": membership.role,
        "email": user.email,
        "full_name": user.full_name,
        "created_at": membership.created_at.isoformat(),
    }


def update_membership_role(
    *,
    tenant_id: str,
    actor_user_id: str,
    membership_id: str,
    role: str,
) -> dict:
    membership = store.memberships.get(membership_id)
    if membership is None or membership.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership nao encontrada.")
    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role do owner nao pode ser alterada.",
        )

    membership.role = role
    store.memberships[membership.id] = membership
    user = store.users[membership.user_id]
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="membership.role_updated",
            resource_type="membership",
            resource_id=membership.id,
            metadata={"role": role},
        )
    )
    return {
        "id": membership.id,
        "user_id": membership.user_id,
        "tenant_id": membership.tenant_id,
        "role": membership.role,
        "email": user.email,
        "full_name": user.full_name,
        "created_at": membership.created_at.isoformat(),
    }


def delete_membership(*, tenant_id: str, actor_user_id: str, membership_id: str) -> None:
    membership = store.memberships.get(membership_id)
    if membership is None or membership.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership nao encontrada.")
    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner nao pode ser removido do workspace.",
        )

    user_memberships = store.memberships_by_user.get(membership.user_id, [])
    store.memberships_by_user[membership.user_id] = [
        stored_membership_id for stored_membership_id in user_memberships if stored_membership_id != membership_id
    ]
    del store.memberships[membership_id]
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="membership.deleted",
            resource_type="membership",
            resource_id=membership_id,
        )
    )
