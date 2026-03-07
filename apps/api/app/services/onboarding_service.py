from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.domain.models import AuditLog, Campaign, OnboardingState
from app.services.store import store


def _derive_completed(
    *,
    campaign_id: str | None,
    team_configured: bool,
    first_opponent_created: bool,
) -> bool:
    return bool(campaign_id and team_configured and first_opponent_created)


def get_onboarding_state(tenant_id: str) -> OnboardingState:
    state = next((item for item in store.onboarding_states.values() if item.tenant_id == tenant_id), None)
    if state is None:
        state = OnboardingState(tenant_id=tenant_id)
        store.onboarding_states[state.id] = state
        store.save()
    return state


def update_onboarding_state(tenant_id: str, actor_user_id: str, updates: dict) -> OnboardingState:
    current = get_onboarding_state(tenant_id)
    campaign_id = updates.get("campaign_id", current.campaign_id)
    team_configured = updates.get("team_configured", current.team_configured)
    first_opponent_created = updates.get("first_opponent_created", current.first_opponent_created)
    state = replace(
        current,
        profile_type=updates.get("profile_type", current.profile_type),
        objective=updates.get("objective", current.objective),
        campaign_id=campaign_id,
        team_configured=team_configured,
        first_opponent_created=first_opponent_created,
        completed=updates.get(
            "completed",
            _derive_completed(
                campaign_id=campaign_id,
                team_configured=team_configured,
                first_opponent_created=first_opponent_created,
            ),
        ),
        updated_at=datetime.now(UTC),
    )
    store.onboarding_states[state.id] = state
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="onboarding.updated",
            resource_type="onboarding",
            resource_id=state.id,
        )
    )
    return state


def create_campaign(
    tenant_id: str,
    actor_user_id: str,
    name: str,
    office: str,
    city: str | None,
    state: str | None,
    phase: str,
) -> Campaign:
    campaign = Campaign(
        tenant_id=tenant_id,
        name=name,
        office=office,
        city=city,
        state=state,
        phase=phase,
        created_by=actor_user_id,
    )
    store.campaigns[campaign.id] = campaign
    update_onboarding_state(tenant_id, actor_user_id, {"campaign_id": campaign.id})
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=actor_user_id,
            action="campaign.created",
            resource_type="campaign",
            resource_id=campaign.id,
        )
    )
    return campaign


def list_campaigns(tenant_id: str) -> list[Campaign]:
    return [campaign for campaign in store.campaigns.values() if campaign.tenant_id == tenant_id]
