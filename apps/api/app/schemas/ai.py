from __future__ import annotations

from pydantic import BaseModel


class AiSummaryResponse(BaseModel):
    headline: str
    module: str
    summary: str
    next_action: str
    action_reason: str
    urgency: str
    recommendations: list[str]
