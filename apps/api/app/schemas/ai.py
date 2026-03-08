from __future__ import annotations

from pydantic import BaseModel


class AiSummaryResponse(BaseModel):
    headline: str
    module: str
    summary: str
    next_action: str
    action_reason: str
    urgency: str
    focus_area: str
    suggested_owner: str
    due_window: str
    blockers: list[str]
    supporting_signals: list[str]
    recommendations: list[str]
