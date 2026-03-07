from __future__ import annotations

from pydantic import BaseModel, Field

from app.domain.models import TaskPriority, TaskStatus


class TaskCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str | None = None
    status: TaskStatus = "backlog"
    priority: TaskPriority = "medium"
    assignee_name: str | None = None
    due_date: str | None = None


class TaskUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    assignee_name: str | None = None
    due_date: str | None = None


class TaskResponse(TaskCreateRequest):
    id: str
    tenant_id: str
    created_by: str
    created_at: str
    updated_at: str
