from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentContextDep
from app.api.permissions import require_min_role
from app.domain.models import to_dict
from app.schemas.opponents import (
    OpponentComparisonItemResponse,
    OpponentCreateRequest,
    OpponentEventCreateRequest,
    OpponentEventResponse,
    OpponentResponse,
    OpponentSummaryResponse,
)
from app.services.crud_service import (
    build_opponents_summary,
    create_opponent,
    create_opponent_event,
    delete_opponent,
    list_opponent_events,
    list_opponents,
)

router = APIRouter(prefix="/opponents", tags=["opponents"])


@router.get("/summary", response_model=OpponentSummaryResponse)
def get_opponents_summary(context: CurrentContextDep) -> dict:
    return build_opponents_summary(context.membership.tenant_id)


@router.get("", response_model=list[OpponentResponse])
def get_opponents(
    context: CurrentContextDep,
    query: Annotated[str | None, Query()] = None,
    tag: Annotated[str | None, Query()] = None,
    stance: Annotated[str | None, Query()] = None,
    watch_level: Annotated[str | None, Query()] = None,
) -> list[dict]:
    return [
        to_dict(opponent)
        for opponent in list_opponents(
            context.membership.tenant_id,
            query=query,
            tag=tag,
            stance=stance,
            watch_level=watch_level,
        )
    ]


@router.post("", response_model=OpponentResponse, status_code=status.HTTP_201_CREATED)
def post_opponent(payload: OpponentCreateRequest, context: CurrentContextDep) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    opponent = create_opponent(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        name=payload.name,
        context=payload.context,
        stance=payload.stance,
        watch_level=payload.watch_level,
        links=payload.links,
        notes=payload.notes,
        tags=payload.tags,
    )
    return to_dict(opponent)


@router.get("/{opponent_id}/events", response_model=list[OpponentEventResponse])
def get_opponent_events(
    opponent_id: str,
    context: CurrentContextDep,
    severity: Annotated[str | None, Query()] = None,
) -> list[dict]:
    events = list_opponent_events(context.membership.tenant_id, opponent_id, severity=severity)
    return [to_dict(event) for event in events]


@router.post("/{opponent_id}/events", response_model=OpponentEventResponse, status_code=status.HTTP_201_CREATED)
def post_opponent_event(
    opponent_id: str,
    payload: OpponentEventCreateRequest,
    context: CurrentContextDep,
) -> dict:
    require_min_role(context, {"owner", "admin", "coordinator", "analyst"})
    event = create_opponent_event(
        tenant_id=context.membership.tenant_id,
        user_id=context.user.id,
        opponent_id=opponent_id,
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        severity=payload.severity,
    )
    return to_dict(event)


@router.delete("/{opponent_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_opponent(opponent_id: str, context: CurrentContextDep) -> None:
    require_min_role(context, {"owner", "admin", "coordinator"})
    delete_opponent(context.membership.tenant_id, context.user.id, opponent_id)
