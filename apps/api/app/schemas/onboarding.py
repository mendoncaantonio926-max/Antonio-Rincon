from __future__ import annotations

from pydantic import BaseModel, Field


class CampaignCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    office: str = Field(min_length=2, max_length=120)
    city: str | None = None
    state: str | None = None
    phase: str = "pre_campaign"


class CampaignResponse(CampaignCreateRequest):
    id: str
    tenant_id: str
    created_by: str
    created_at: str
    updated_at: str


class OnboardingUpdateRequest(BaseModel):
    profile_type: str | None = None
    objective: str | None = None
    campaign_id: str | None = None
    team_configured: bool | None = None
    first_opponent_created: bool | None = None
    completed: bool | None = None


class OnboardingStateResponse(BaseModel):
    id: str
    tenant_id: str
    profile_type: str | None = None
    objective: str | None = None
    campaign_id: str | None = None
    team_configured: bool
    first_opponent_created: bool
    completed: bool
    created_at: str
    updated_at: str
