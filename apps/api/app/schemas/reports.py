from __future__ import annotations

from pydantic import BaseModel, Field


class ReportCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    report_type: str = "operational"


class ReportMetricsResponse(BaseModel):
    contacts_count: int
    priority_contacts_count: int
    open_tasks_count: int
    overdue_tasks_count: int
    opponents_count: int
    opponent_events_count: int


class ReportResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    report_type: str
    summary: str
    created_by: str
    created_at: str
    metrics: ReportMetricsResponse


class ReportExportResponse(BaseModel):
    filename: str
    content: str
    watermark: str
