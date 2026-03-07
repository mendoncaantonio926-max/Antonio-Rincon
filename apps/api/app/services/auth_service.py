from __future__ import annotations

from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.domain.models import AuditLog, Membership, OnboardingState, Subscription, Tenant, User
from app.schemas.auth import AuthResponse, AuthTokens, MembershipResponse, UserResponse
from app.services.store import store


def _build_user_response(user: User) -> UserResponse:
    membership_ids = store.memberships_by_user.get(user.id, [])
    memberships = [
        MembershipResponse(
            tenant_id=store.memberships[membership_id].tenant_id,
            role=store.memberships[membership_id].role,
        )
        for membership_id in membership_ids
    ]
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        memberships=memberships,
    )


def _issue_auth_response(user: User, membership: Membership) -> AuthResponse:
    tokens = AuthTokens(
        access_token=create_access_token(user.id, membership.tenant_id),
        refresh_token=create_refresh_token(user.id),
    )
    return AuthResponse(tokens=tokens, user=_build_user_response(user))


def register_user(*, full_name: str, email: str, password: str, tenant_name: str) -> AuthResponse:
    normalized_email = email.lower()
    if normalized_email in store.users_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ja cadastrado.",
        )

    tenant = Tenant(name=tenant_name)
    user = User(email=normalized_email, full_name=full_name, password_hash=hash_password(password))
    membership = Membership(user_id=user.id, tenant_id=tenant.id, role="owner")

    store.tenants[tenant.id] = tenant
    store.users[user.id] = user
    store.users_by_email[normalized_email] = user.id
    store.memberships[membership.id] = membership
    store.memberships_by_user[user.id] = [membership.id]
    onboarding_state = OnboardingState(tenant_id=tenant.id)
    subscription = Subscription(tenant_id=tenant.id, trial_ends_at="2026-03-20")
    store.onboarding_states[onboarding_state.id] = onboarding_state
    store.subscriptions[subscription.id] = subscription
    store.log_action(
        AuditLog(
            tenant_id=tenant.id,
            actor_user_id=user.id,
            action="auth.registered",
            resource_type="user",
            resource_id=user.id,
        )
    )

    return _issue_auth_response(user, membership)


def login_user(*, email: str, password: str) -> AuthResponse:
    normalized_email = email.lower()
    user_id = store.users_by_email.get(normalized_email)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais invalidas.",
        )

    user = store.users[user_id]
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais invalidas.",
        )

    membership_ids = store.memberships_by_user.get(user.id, [])
    if not membership_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario sem workspace ativo.",
        )

    membership = store.memberships[membership_ids[0]]
    store.log_action(
        AuditLog(
            tenant_id=membership.tenant_id,
            actor_user_id=user.id,
            action="auth.logged_in",
            resource_type="user",
            resource_id=user.id,
        )
    )
    return _issue_auth_response(user, membership)


def refresh_user_token(refresh_token: str) -> AuthTokens:
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalido.",
        )

    user_id = str(payload.get("sub"))
    membership_ids = store.memberships_by_user.get(user_id, [])
    if not membership_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario sem membership.",
        )

    membership = store.memberships[membership_ids[0]]
    return AuthTokens(
        access_token=create_access_token(user_id, membership.tenant_id),
        refresh_token=create_refresh_token(user_id),
    )
