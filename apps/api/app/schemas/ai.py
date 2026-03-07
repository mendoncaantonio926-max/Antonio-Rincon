from __future__ import annotations

from pydantic import BaseModel


class AiSummaryResponse(BaseModel):
    headline: str
    module: str
    summary: str
    recommendations: list[str]
