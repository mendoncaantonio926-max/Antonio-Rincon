from __future__ import annotations

from pydantic import BaseModel


class AiExecutionPayloadResponse(BaseModel):
    owner_user_id: str | None = None
    follow_up_at: str | None = None


class AiExecutionStepResponse(BaseModel):
    lead_id: str
    lead_name: str
    step_label: str
    owner_user_id: str | None = None
    follow_up_at: str | None = None


class AiExecutionOutlookResponse(BaseModel):
    batch_size: int
    expected_gain: int
    remaining_queue: int
    recovered_gap: int
    reduced_critical_queue: int
    summary: str


class AiSummaryResponse(BaseModel):
    headline: str
    module: str
    summary: str
    next_action: str
    action_reason: str
    urgency: str
    priority_score: int
    trigger_signal: str
    focus_area: str
    suggested_owner: str
    due_window: str
    blockers: list[str]
    supporting_signals: list[str]
    recommendations: list[str]
    execution_label: str | None = None
    execution_mode: str | None = None
    execution_payload: AiExecutionPayloadResponse | None = None
    execution_batch: list[AiExecutionStepResponse] = []
    execution_outlook: AiExecutionOutlookResponse | None = None
