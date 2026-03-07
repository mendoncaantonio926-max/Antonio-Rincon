from fastapi import APIRouter, status

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.schemas.settings import MembershipRoleUpdateRequest
from app.schemas.memberships import MembershipInviteRequest, MembershipResponse
from app.services.membership_service import (
    delete_membership,
    invite_member,
    list_memberships,
    update_membership_role,
)

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("", response_model=list[MembershipResponse])
def get_memberships(context: CurrentContextDep) -> list[dict]:
    require_min_role(context, {"owner", "admin", "coordinator"})
    return list_memberships(context.membership.tenant_id)


@router.post("/invite", response_model=MembershipResponse, status_code=status.HTTP_201_CREATED)
def post_invite(payload: MembershipInviteRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin"})
    return invite_member(
        tenant_id=context.membership.tenant_id,
        actor_user_id=context.user.id,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
    )


@router.patch("/{membership_id}/role", response_model=MembershipResponse)
def patch_membership_role(
    membership_id: str,
    payload: MembershipRoleUpdateRequest,
    context: CurrentContextDep,
) -> dict:
    require_min_role(context, {"owner", "admin"})
    return update_membership_role(
        tenant_id=context.membership.tenant_id,
        actor_user_id=context.user.id,
        membership_id=membership_id,
        role=payload.role,
    )


@router.delete("/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_membership(membership_id: str, context: CurrentContextDep) -> None:
    require_min_role(context, {"owner", "admin"})
    delete_membership(
        tenant_id=context.membership.tenant_id,
        actor_user_id=context.user.id,
        membership_id=membership_id,
    )
