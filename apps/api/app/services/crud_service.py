from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi import HTTPException, status

from app.domain.models import AuditLog, Contact, Opponent, OpponentEvent, Task
from app.services.onboarding_service import update_onboarding_state
from app.services.store import store


def list_contacts(
    tenant_id: str,
    query: str | None = None,
    kind: str | None = None,
    status_value: str | None = None,
    city: str | None = None,
    tag: str | None = None,
) -> list[Contact]:
    contacts = [contact for contact in store.contacts.values() if contact.tenant_id == tenant_id]
    if query:
        normalized_query = query.lower()
        contacts = [
            contact
            for contact in contacts
            if normalized_query in contact.name.lower()
            or normalized_query in (contact.email or "").lower()
            or normalized_query in (contact.phone or "").lower()
            or normalized_query in (contact.city or "").lower()
            or normalized_query in (contact.notes or "").lower()
            or any(normalized_query in contact_tag.lower() for contact_tag in contact.tags)
            or any(normalized_query in note["content"].lower() for note in contact.note_history)
        ]
    if kind:
        contacts = [contact for contact in contacts if contact.kind == kind]
    if status_value:
        contacts = [contact for contact in contacts if contact.status == status_value]
    if city:
        normalized_city = city.lower()
        contacts = [contact for contact in contacts if normalized_city in (contact.city or "").lower()]
    if tag:
        normalized_tag = tag.lower()
        contacts = [
            contact for contact in contacts if any(normalized_tag in contact_tag.lower() for contact_tag in contact.tags)
        ]
    contacts.sort(key=lambda item: item.updated_at, reverse=True)
    return contacts


def create_contact(
    *,
    tenant_id: str,
    user_id: str,
    name: str,
    kind: str,
    status: str,
    email: str | None,
    phone: str | None,
    city: str | None,
    notes: str | None,
    tags: list[str],
) -> Contact:
    note_history = []
    if notes:
        note_history.append(
            {
                "id": str(uuid4()),
                "content": notes,
                "created_at": datetime.now(UTC).isoformat(),
                "created_by": user_id,
            }
        )
    contact = Contact(
        tenant_id=tenant_id,
        name=name,
        kind=kind,
        status=status,
        email=email,
        phone=phone,
        city=city,
        notes=notes,
        tags=tags,
        note_history=note_history,
        created_by=user_id,
    )
    store.contacts[contact.id] = contact
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="contact.created",
            resource_type="contact",
            resource_id=contact.id,
        )
    )
    return contact


def add_contact_note(tenant_id: str, user_id: str, contact_id: str, content: str) -> Contact:
    contact = store.contacts.get(contact_id)
    if contact is None or contact.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contato nao encontrado.")

    note = {
        "id": str(uuid4()),
        "content": content,
        "created_at": datetime.now(UTC).isoformat(),
        "created_by": user_id,
    }
    updated_history = [note, *contact.note_history]
    updated_contact = replace(
        contact,
        notes=content,
        note_history=updated_history,
        updated_at=datetime.now(UTC),
    )
    store.contacts[contact.id] = updated_contact
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="contact.note.created",
            resource_type="contact",
            resource_id=contact_id,
        )
    )
    return updated_contact


def update_contact(tenant_id: str, user_id: str, contact_id: str, updates: dict) -> Contact:
    contact = store.contacts.get(contact_id)
    if contact is None or contact.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contato nao encontrado.")

    updated_contact = replace(
        contact,
        name=updates.get("name", contact.name),
        kind=updates.get("kind", contact.kind),
        status=updates.get("status", contact.status),
        email=updates.get("email", contact.email),
        phone=updates.get("phone", contact.phone),
        city=updates.get("city", contact.city),
        notes=updates.get("notes", contact.notes),
        tags=updates.get("tags", contact.tags),
        updated_at=datetime.now(UTC),
    )
    store.contacts[contact.id] = updated_contact
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="contact.updated",
            resource_type="contact",
            resource_id=contact.id,
        )
    )
    return updated_contact


def delete_contact(tenant_id: str, user_id: str, contact_id: str) -> None:
    contact = store.contacts.get(contact_id)
    if contact is None or contact.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contato nao encontrado.")
    del store.contacts[contact_id]
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="contact.deleted",
            resource_type="contact",
            resource_id=contact_id,
        )
    )


def list_tasks(
    tenant_id: str,
    query: str | None = None,
    status_value: str | None = None,
    priority: str | None = None,
) -> list[Task]:
    tasks = [task for task in store.tasks.values() if task.tenant_id == tenant_id]
    if query:
        normalized_query = query.lower()
        tasks = [
            task
            for task in tasks
            if normalized_query in task.title.lower()
            or normalized_query in (task.description or "").lower()
            or normalized_query in (task.assignee_name or "").lower()
        ]
    if status_value:
        tasks = [task for task in tasks if task.status == status_value]
    if priority:
        tasks = [task for task in tasks if task.priority == priority]
    tasks.sort(key=lambda item: item.updated_at, reverse=True)
    return tasks


def create_task(
    *,
    tenant_id: str,
    user_id: str,
    title: str,
    description: str | None,
    status_value: str,
    priority: str,
    assignee_name: str | None,
    due_date: str | None,
) -> Task:
    task = Task(
        tenant_id=tenant_id,
        title=title,
        description=description,
        status=status_value,
        priority=priority,
        assignee_name=assignee_name,
        due_date=due_date,
        created_by=user_id,
    )
    store.tasks[task.id] = task
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="task.created",
            resource_type="task",
            resource_id=task.id,
        )
    )
    return task


def update_task(tenant_id: str, user_id: str, task_id: str, updates: dict) -> Task:
    task = store.tasks.get(task_id)
    if task is None or task.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa nao encontrada.")

    task = replace(
        task,
        title=updates.get("title", task.title),
        description=updates.get("description", task.description),
        status=updates.get("status", task.status),
        priority=updates.get("priority", task.priority),
        assignee_name=updates.get("assignee_name", task.assignee_name),
        due_date=updates.get("due_date", task.due_date),
        updated_at=datetime.now(UTC),
    )
    store.tasks[task.id] = task
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="task.updated",
            resource_type="task",
            resource_id=task.id,
        )
    )
    return task


def delete_task(tenant_id: str, user_id: str, task_id: str) -> None:
    task = store.tasks.get(task_id)
    if task is None or task.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarefa nao encontrada.")
    del store.tasks[task_id]
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="task.deleted",
            resource_type="task",
            resource_id=task_id,
        )
    )


def create_opponent(
    *,
    tenant_id: str,
    user_id: str,
    name: str,
    context: str,
    stance: str,
    watch_level: str,
    links: list[str],
    notes: str | None,
    tags: list[str],
) -> Opponent:
    opponent = Opponent(
        tenant_id=tenant_id,
        name=name,
        context=context,
        stance=stance,
        watch_level=watch_level,
        links=links,
        notes=notes,
        tags=tags,
        created_by=user_id,
    )
    store.opponents[opponent.id] = opponent
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="opponent.created",
            resource_type="opponent",
            resource_id=opponent.id,
        )
    )
    update_onboarding_state(tenant_id, user_id, {"first_opponent_created": True})
    return opponent


def list_opponents(
    tenant_id: str,
    query: str | None = None,
    tag: str | None = None,
    stance: str | None = None,
    watch_level: str | None = None,
) -> list[Opponent]:
    opponents = [opponent for opponent in store.opponents.values() if opponent.tenant_id == tenant_id]
    if query:
        normalized_query = query.lower()
        opponents = [
            opponent
            for opponent in opponents
            if normalized_query in opponent.name.lower()
            or normalized_query in opponent.context.lower()
            or normalized_query in (opponent.notes or "").lower()
            or any(normalized_query in item.lower() for item in opponent.tags)
        ]
    if tag:
        normalized_tag = tag.lower()
        opponents = [
            opponent for opponent in opponents if any(normalized_tag in item.lower() for item in opponent.tags)
        ]
    if stance:
        opponents = [opponent for opponent in opponents if opponent.stance == stance]
    if watch_level:
        opponents = [opponent for opponent in opponents if opponent.watch_level == watch_level]
    opponents.sort(key=lambda item: item.updated_at, reverse=True)
    return opponents


def create_opponent_event(
    *,
    tenant_id: str,
    user_id: str,
    opponent_id: str,
    title: str,
    description: str,
    event_date: str,
    severity: str,
) -> OpponentEvent:
    opponent = store.opponents.get(opponent_id)
    if opponent is None or opponent.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversario nao encontrado.")

    event = OpponentEvent(
        tenant_id=tenant_id,
        opponent_id=opponent_id,
        title=title,
        description=description,
        event_date=event_date,
        severity=severity,
        created_by=user_id,
    )
    store.opponent_events[event.id] = event
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="opponent.event.created",
            resource_type="opponent_event",
            resource_id=event.id,
            metadata={"opponent_id": opponent_id},
        )
    )
    return event


def list_opponent_events(tenant_id: str, opponent_id: str, severity: str | None = None) -> list[OpponentEvent]:
    events = [
        event
        for event in store.opponent_events.values()
        if event.tenant_id == tenant_id and event.opponent_id == opponent_id
    ]
    if severity:
        events = [event for event in events if event.severity == severity]
    events.sort(key=lambda item: item.event_date, reverse=True)
    return events


def build_opponents_summary(tenant_id: str) -> dict:
    opponents = list_opponents(tenant_id)
    recent_threshold = (datetime.now(UTC).date() - timedelta(days=30)).isoformat()
    stance_distribution = {"incumbent": 0, "challenger": 0, "ally_risk": 0, "local_force": 0}
    watch_distribution = {"observe": 0, "attention": 0, "critical": 0}
    comparison_items: list[dict] = []
    total_critical_events = 0
    total_recent_events = 0

    for opponent in opponents:
        stance_distribution[opponent.stance] = stance_distribution.get(opponent.stance, 0) + 1
        watch_distribution[opponent.watch_level] = watch_distribution.get(opponent.watch_level, 0) + 1
        events = list_opponent_events(tenant_id, opponent.id)
        critical_events = len([event for event in events if event.severity == "critical"])
        recent_events = len([event for event in events if event.event_date >= recent_threshold])
        total_critical_events += critical_events
        total_recent_events += recent_events
        comparison_items.append(
            {
                "opponent_id": opponent.id,
                "name": opponent.name,
                "stance": opponent.stance,
                "watch_level": opponent.watch_level,
                "total_events": len(events),
                "critical_events": critical_events,
                "recent_events": recent_events,
                "last_event_date": events[0].event_date if events else None,
            }
        )

    comparison_items.sort(
        key=lambda item: (item["critical_events"], item["recent_events"], item["total_events"]),
        reverse=True,
    )
    return {
        "total_opponents": len(opponents),
        "critical_watch_count": watch_distribution.get("critical", 0),
        "critical_events_count": total_critical_events,
        "recent_events_count": total_recent_events,
        "stance_distribution": stance_distribution,
        "watch_distribution": watch_distribution,
        "top_watchlist": comparison_items[:5],
    }


def delete_opponent(tenant_id: str, user_id: str, opponent_id: str) -> None:
    opponent = store.opponents.get(opponent_id)
    if opponent is None or opponent.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adversario nao encontrado.")

    event_ids = [
        event.id
        for event in store.opponent_events.values()
        if event.tenant_id == tenant_id and event.opponent_id == opponent_id
    ]
    for event_id in event_ids:
        del store.opponent_events[event_id]
    del store.opponents[opponent_id]
    store.log_action(
        AuditLog(
            tenant_id=tenant_id,
            actor_user_id=user_id,
            action="opponent.deleted",
            resource_type="opponent",
            resource_id=opponent_id,
        )
    )
