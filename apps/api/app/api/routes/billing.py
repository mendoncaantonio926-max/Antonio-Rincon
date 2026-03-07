from fastapi import APIRouter

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.schemas.billing import (
    BillingEventResponse,
    CheckoutRequest,
    CheckoutResponse,
    PlanCatalogItemResponse,
    SubscriptionActionRequest,
    SubscriptionActionResponse,
    SubscriptionResponse,
)
from app.services.plan_service import (
    apply_subscription_action,
    get_subscription_for_tenant,
    list_billing_events,
    list_plan_catalog,
    serialize_subscription,
    update_subscription_plan,
)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/subscription", response_model=SubscriptionResponse)
def get_subscription(context: CurrentContextDep) -> dict:
    return serialize_subscription(get_subscription_for_tenant(context.membership.tenant_id))


@router.get("/plans", response_model=list[PlanCatalogItemResponse])
def get_plans() -> list[dict]:
    return list_plan_catalog()


@router.get("/events", response_model=list[BillingEventResponse])
def get_billing_events(context: CurrentContextDep) -> list[dict]:
    return list_billing_events(context.membership.tenant_id)


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutRequest, context: CurrentContextDep) -> CheckoutResponse:
    require_min_role(context, {"owner", "admin"})
    update_subscription_plan(context.membership.tenant_id, context.user.id, payload.plan)
    return CheckoutResponse(
        checkout_url=f"/billing/success?plan={payload.plan}",
        message=f"Plano {payload.plan} ativado em modo local.",
    )


@router.post("/subscription/action", response_model=SubscriptionActionResponse)
def change_subscription_action(payload: SubscriptionActionRequest, context: CurrentContextDep) -> SubscriptionActionResponse:
    require_min_role(context, {"owner", "admin"})
    _, message = apply_subscription_action(context.membership.tenant_id, context.user.id, payload.action)
    return SubscriptionActionResponse(message=message)
