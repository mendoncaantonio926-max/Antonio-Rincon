from __future__ import annotations

from datetime import UTC, datetime, date, timedelta

from fastapi import HTTPException, status

from app.domain.models import AuditLog, Subscription
from app.services.store import store


PLAN_CONFIG = {
    "essential": {
        "seats_included": 1,
        "ai_requests_limit": 50,
        "report_exports_limit": 10,
        "recommended_for": "Operacao inicial e validacao comercial enxuta.",
    },
    "pro": {
        "seats_included": 3,
        "ai_requests_limit": 150,
        "report_exports_limit": 40,
        "recommended_for": "Coordenacao pequena com rotina recorrente e relatorios frequentes.",
    },
    "executive": {
        "seats_included": 10,
        "ai_requests_limit": 300,
        "report_exports_limit": 100,
        "recommended_for": "Equipe estruturada com monitoramento continuo e governanca maior.",
    },
    "enterprise": {
        "seats_included": 999,
        "ai_requests_limit": 9999,
        "report_exports_limit": 9999,
        "recommended_for": "Partidos, consultorias e estruturas multiusuario com alta escala.",
    },
}


def list_plan_catalog() -> list[dict[str, str | int]]:
    return [{"plan": plan, **config} for plan, config in PLAN_CONFIG.items()]


def get_trial_days_remaining(subscription: Subscription) -> int:
    if not subscription.trial_ends_at:
        return 0
    try:
        trial_end = date.fromisoformat(subscription.trial_ends_at)
    except ValueError:
        return 0
    return max((trial_end - date.today()).days, 0)


def get_suggested_plan(subscription: Subscription) -> str:
    if subscription.status == "trialing":
        return "pro"
    if subscription.seats_included <= 1:
        return "pro"
    if subscription.seats_included <= 3:
        return "executive"
    return "enterprise"


def get_commercial_status(subscription: Subscription) -> str:
    if subscription.cancel_at_period_end and subscription.status in {"active", "trialing"}:
        return "cancelamento_agendado"
    if subscription.status == "trialing":
        return "trial_ativo"
    if subscription.status == "past_due":
        return "pendencia_financeira"
    if subscription.status == "canceled":
        return "cancelado"
    return "ativo"


def serialize_subscription(subscription: Subscription) -> dict[str, str | int | bool]:
    payload = {
        "id": subscription.id,
        "tenant_id": subscription.tenant_id,
        "plan": subscription.plan,
        "status": subscription.status,
        "billing_cycle": subscription.billing_cycle,
        "trial_ends_at": subscription.trial_ends_at,
        "current_period_ends_at": subscription.current_period_ends_at,
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "trial_days_remaining": get_trial_days_remaining(subscription),
        "seats_included": subscription.seats_included,
        "ai_requests_limit": subscription.ai_requests_limit,
        "report_exports_limit": subscription.report_exports_limit,
        "suggested_plan": get_suggested_plan(subscription),
        "can_export_reports": subscription.report_exports_limit > 0,
        "commercial_status": get_commercial_status(subscription),
        "next_billing_at": subscription.current_period_ends_at,
        "created_at": subscription.created_at.isoformat(),
        "updated_at": subscription.updated_at.isoformat(),
    }
    return payload


def get_subscription_for_tenant(tenant_id: str) -> Subscription:
    subscription = next(
        (item for item in store.subscriptions.values() if item.tenant_id == tenant_id),
        None,
    )
    if subscription is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assinatura nao encontrada.")
    return subscription


def update_subscription_plan(tenant_id: str, actor_user_id: str, plan: str) -> Subscription:
    if plan not in PLAN_CONFIG:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plano invalido.")
    subscription = get_subscription_for_tenant(tenant_id)
    config = PLAN_CONFIG[plan]
    subscription.plan = plan
    subscription.status = "active"
    subscription.billing_cycle = "monthly"
    subscription.trial_ends_at = None
    subscription.current_period_ends_at = (date.today() + timedelta(days=30)).isoformat()
    subscription.cancel_at_period_end = False
    subscription.seats_included = config["seats_included"]
    subscription.ai_requests_limit = config["ai_requests_limit"]
    subscription.report_exports_limit = config["report_exports_limit"]
    subscription.updated_at = datetime.now(UTC)
    store.subscriptions[subscription.id] = subscription
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="billing.plan_updated",
            resource_type="subscription",
            resource_id=subscription.id,
            metadata={"plan": plan, "status": subscription.status, "next_billing_at": subscription.current_period_ends_at},
        )
    )
    return subscription


def apply_subscription_action(tenant_id: str, actor_user_id: str, action: str) -> tuple[Subscription, str]:
    subscription = get_subscription_for_tenant(tenant_id)

    if action == "cancel":
        if subscription.status == "canceled":
            message = "Assinatura ja estava cancelada."
        else:
            subscription.cancel_at_period_end = True
            if subscription.current_period_ends_at is None:
                subscription.current_period_ends_at = (date.today() + timedelta(days=30)).isoformat()
            message = "Cancelamento agendado para o fim do periodo atual."
    elif action == "reactivate":
        subscription.cancel_at_period_end = False
        if subscription.status == "canceled":
            subscription.status = "active"
        if subscription.current_period_ends_at is None:
            subscription.current_period_ends_at = (date.today() + timedelta(days=30)).isoformat()
        message = "Assinatura reativada e renovada para seguir ativa."
    elif action == "renew_trial":
        subscription.status = "trialing"
        subscription.trial_ends_at = (date.today() + timedelta(days=14)).isoformat()
        subscription.current_period_ends_at = subscription.trial_ends_at
        subscription.cancel_at_period_end = False
        message = "Trial renovado por 14 dias em modo local."
    elif action == "mark_past_due":
        subscription.status = "past_due"
        subscription.cancel_at_period_end = False
        message = "Assinatura marcada como pendente em modo local."
    elif action == "resolve_past_due":
        subscription.status = "active"
        if subscription.current_period_ends_at is None:
            subscription.current_period_ends_at = (date.today() + timedelta(days=30)).isoformat()
        message = "Pendencia resolvida e assinatura reativada."
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Acao de assinatura invalida.")

    subscription.updated_at = datetime.now(UTC)
    store.subscriptions[subscription.id] = subscription
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action=f"billing.subscription_{action}",
            resource_type="subscription",
            resource_id=subscription.id,
            metadata={
                "plan": subscription.plan,
                "status": subscription.status,
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "current_period_ends_at": subscription.current_period_ends_at,
            },
        )
    )
    return subscription, message


def list_billing_events(tenant_id: str) -> list[dict[str, str]]:
    entries = [
        item
        for item in store.audit_logs.values()
        if item.tenant_id == tenant_id and item.resource_type == "subscription" and item.action.startswith("billing.")
    ]
    entries.sort(key=lambda item: item.created_at, reverse=True)
    event_titles = {
        "billing.plan_updated": "Plano alterado",
        "billing.subscription_cancel": "Cancelamento agendado",
        "billing.subscription_reactivate": "Assinatura reativada",
        "billing.subscription_renew_trial": "Trial renovado",
        "billing.subscription_mark_past_due": "Assinatura em pendencia",
        "billing.subscription_resolve_past_due": "Pendencia resolvida",
    }
    serialized: list[dict[str, str]] = []
    for item in entries:
        serialized.append(
            {
                "id": item.id,
                "action": item.action,
                "title": event_titles.get(item.action, "Atualizacao comercial"),
                "detail": (
                    f"Plano {item.metadata.get('plan', '-')}, status {item.metadata.get('status', '-')}, "
                    f"proxima referencia {item.metadata.get('current_period_ends_at') or item.metadata.get('next_billing_at') or '-'}."
                ),
                "created_at": item.created_at.isoformat(),
            }
        )
    return serialized


def require_report_export_capacity(tenant_id: str) -> None:
    subscription = get_subscription_for_tenant(tenant_id)
    if subscription.report_exports_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Limite de exportacoes do plano atingido.",
        )


def consume_report_export(tenant_id: str) -> Subscription:
    subscription = get_subscription_for_tenant(tenant_id)
    if subscription.report_exports_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Limite de exportacoes do plano atingido.",
        )
    subscription.report_exports_limit -= 1
    subscription.updated_at = datetime.now(UTC)
    store.subscriptions[subscription.id] = subscription
    store.save()
    return subscription
