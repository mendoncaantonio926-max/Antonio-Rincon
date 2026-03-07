from __future__ import annotations

from pydantic import BaseModel, Field


class OpponentCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    context: str = Field(min_length=2, max_length=160)
    stance: str = "challenger"
    watch_level: str = "attention"
    links: list[str] = Field(default_factory=list)
    notes: str | None = None
    tags: list[str] = Field(default_factory=list)


class OpponentResponse(OpponentCreateRequest):
    id: str
    tenant_id: str
    created_by: str
    created_at: str
    updated_at: str


class OpponentEventCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=2, max_length=500)
    event_date: str
    severity: str = "info"


class OpponentEventResponse(OpponentEventCreateRequest):
    id: str
    tenant_id: str
    opponent_id: str
    created_by: str
    created_at: str


class OpponentComparisonItemResponse(BaseModel):
    opponent_id: str
    name: str
    stance: str
    watch_level: str
    total_events: int
    critical_events: int
    recent_events: int
    last_event_date: str | None = None


class OpponentSummaryResponse(BaseModel):
    total_opponents: int
    critical_watch_count: int
    critical_events_count: int
    recent_events_count: int
    stance_distribution: dict[str, int]
    watch_distribution: dict[str, int]
    top_watchlist: list[OpponentComparisonItemResponse]
