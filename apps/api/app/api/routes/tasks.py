from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.tasks import TaskCreateRequest, TaskResponse, TaskUpdateRequest
from app.services.crud_service import create_task, delete_task, list_tasks, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    context: CurrentContextDep,
    query: Annotated[str | None, Query()] = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    priority: Annotated[str | None, Query()] = None,
) -> list[dict]:
    tasks = list_tasks(
        context.membership.tenant_id,
        query=query,
        status_value=status_filter,
        priority=priority,
    )
    return [to_dict(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=201)
def post_task(payload: TaskCreateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    task = create_task(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        title=payload.title,
        description=payload.description,
        status_value=payload.status,
        priority=payload.priority,
        assignee_name=payload.assignee_name,
        due_date=payload.due_date,
    )
    return to_dict(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def patch_task(task_id: str, payload: TaskUpdateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    task = update_task(
        context.membership.tenant_id,
        context.user.id,
        task_id,
        payload.model_dump(exclude_none=True),
    )
    return to_dict(task)


@router.delete("/{task_id}", status_code=204)
def remove_task(task_id: str, context: CurrentContextDep) -> None:
    require_min_role(context, {"owner", "admin", "coordinator"})
    delete_task(context.membership.tenant_id, context.user.id, task_id)
