from __future__ import annotations

from datetime import date, timedelta

from app.services.public_service import serialize_lead
from app.services.crud_service import list_contacts, list_opponents, list_tasks
from app.services.plan_service import get_subscription_for_tenant
from app.services.report_service import list_reports
from app.services.store import store


def _parse_iso_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def get_dashboard_summary(tenant_id: str) -> dict[str, object]:
    tenant = store.tenants[tenant_id]
    subscription = get_subscription_for_tenant(tenant_id)
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    reports = list_reports(tenant_id)
    leads = list(store.leads.values())
    memberships_count = len([membership for membership in store.memberships.values() if membership.tenant_id == tenant_id])
    today_date = date.today()
    today = today_date.isoformat()
    converted_leads_count = len([lead for lead in leads if lead.converted_contact_id])
    pending_leads_count = len(leads) - converted_leads_count
    pending_leads = [
        serialize_lead(lead, tenant_id) for lead in leads if not lead.converted_contact_id
    ]
    bucket_order = {
        "overdue": 0,
        "today": 1,
        "this_week": 2,
        "later": 3,
        "unscheduled": 4,
    }
    pending_leads.sort(
        key=lambda item: (
            bucket_order.get(str(item["follow_up_bucket"]), 99),
            -int(item["risk_score"]),
            str(item["follow_up_at"] or "9999-12-31"),
            str(item["created_at"]),
        )
    )
    priority_lead = pending_leads[0] if pending_leads else None
    critical_queue_count = len(
        [item for item in pending_leads if item["priority_label"] in {"high", "critical"}]
    )
    overdue_followups_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at and lead.follow_up_at < today
        ]
    )
    due_today_followups_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at and lead.follow_up_at == today
        ]
    )
    hot_leads_count = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.stage in {"qualified", "follow_up", "proposal"}
        ]
    )
    overdue_tasks_count = 0

    for task in tasks:
        if task.status == "done" or not task.due_date:
            continue
        if task.due_date < today:
            overdue_tasks_count += 1

    if overdue_tasks_count > 0:
        next_action = "Priorize tarefas vencidas para recuperar o ritmo operacional."
    elif overdue_followups_count > 0:
        next_action = "Regularize follow-ups comerciais atrasados para proteger conversao."
    elif pending_leads_count > 0:
        next_action = "Converta os leads captados para nao perder janela comercial."
    elif len([contact for contact in contacts if contact.status == "priority"]) == 0 and contacts:
        next_action = "Classifique contatos prioritarios para orientar a coordenacao."
    elif not reports:
        next_action = "Gere um relatorio executivo para consolidar o momento da operacao."
    elif not opponents:
        next_action = "Cadastre o primeiro adversario para ativar monitoramento estrategico."
    else:
        next_action = "Workspace ativo. Mantenha contatos, tarefas e relatorios atualizados."

    follow_up_bucket_labels = {
        "overdue": "Atrasado",
        "today": "Hoje",
        "this_week": "Esta semana",
        "later": "Mais a frente",
        "unscheduled": "Sem agenda",
    }
    owner_groups: dict[str, dict[str, str | int]] = {}
    for item in pending_leads:
        owner_label = str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner")
        group = owner_groups.setdefault(
            owner_label,
            {
                "label": owner_label,
                "leads_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if item["follow_up_bucket"] == "overdue":
            group["overdue_count"] = int(group["overdue_count"]) + 1
        if item["follow_up_bucket"] == "today":
            group["due_today_count"] = int(group["due_today_count"]) + 1

    window_groups: dict[str, dict[str, str | int]] = {}
    for item in pending_leads:
        window_label = follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda")
        group = window_groups.setdefault(
            window_label,
            {
                "label": window_label,
                "leads_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if item["follow_up_bucket"] == "overdue":
            group["overdue_count"] = int(group["overdue_count"]) + 1
        if item["follow_up_bucket"] == "today":
            group["due_today_count"] = int(group["due_today_count"]) + 1

    commercial_owner_groups = sorted(
        owner_groups.values(),
        key=lambda item: (-int(item["overdue_count"]), -int(item["leads_count"]), str(item["label"])),
    )
    commercial_window_groups = sorted(
        window_groups.values(),
        key=lambda item: (-int(item["overdue_count"]), -int(item["due_today_count"]), -int(item["leads_count"])),
    )
    owner_alerts = []
    for group in commercial_owner_groups:
        severity = "normal"
        if int(group["overdue_count"]) > 0:
            severity = "critical"
        elif int(group["due_today_count"]) > 0:
            severity = "attention"
        if int(group["leads_count"]) >= 3 and severity == "normal":
            severity = "attention"
        owner_alerts.append(
            {
                "owner_label": str(group["label"]),
                "severity": severity,
                "summary": (
                    f"{group['label']}: {group['leads_count']} lead(s), "
                    f"{group['overdue_count']} atrasado(s), {group['due_today_count']} para hoje."
                ),
            }
        )
    owner_productivity_map: dict[str, dict[str, str | int]] = {}
    for lead in leads:
        serialized = serialize_lead(lead, tenant_id)
        owner_label = str(serialized["owner_name"] or serialized["suggested_owner_name"] or "Sem owner")
        group = owner_productivity_map.setdefault(
            owner_label,
            {
                "label": owner_label,
                "pending_count": 0,
                "converted_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        if serialized["converted_contact_id"]:
            group["converted_count"] = int(group["converted_count"]) + 1
        else:
            group["pending_count"] = int(group["pending_count"]) + 1
            if serialized["follow_up_bucket"] == "overdue":
                group["overdue_count"] = int(group["overdue_count"]) + 1
            if serialized["follow_up_bucket"] == "today":
                group["due_today_count"] = int(group["due_today_count"]) + 1

    window_productivity_map: dict[str, dict[str, str | int]] = {}
    for lead in leads:
        serialized = serialize_lead(lead, tenant_id)
        window_label = follow_up_bucket_labels.get(
            str(serialized["follow_up_bucket"]),
            "Convertido" if serialized["converted_contact_id"] else "Sem agenda",
        )
        group = window_productivity_map.setdefault(
            window_label,
            {
                "label": window_label,
                "pending_count": 0,
                "converted_count": 0,
                "overdue_count": 0,
                "due_today_count": 0,
            },
        )
        if serialized["converted_contact_id"]:
            group["converted_count"] = int(group["converted_count"]) + 1
        else:
            group["pending_count"] = int(group["pending_count"]) + 1
            if serialized["follow_up_bucket"] == "overdue":
                group["overdue_count"] = int(group["overdue_count"]) + 1
            if serialized["follow_up_bucket"] == "today":
                group["due_today_count"] = int(group["due_today_count"]) + 1
    owner_productivity = sorted(
        owner_productivity_map.values(),
        key=lambda item: (
            -int(item["converted_count"]),
            -int(item["pending_count"]),
            -int(item["overdue_count"]),
            str(item["label"]),
        ),
    )
    window_productivity = sorted(
        window_productivity_map.values(),
        key=lambda item: (
            -int(item["converted_count"]),
            -int(item["pending_count"]),
            -int(item["overdue_count"]),
            str(item["label"]),
        ),
    )
    owner_targets = []
    for item in owner_productivity:
        target_conversions = max(
            1,
            (int(item["pending_count"]) + int(item["converted_count"]) + 1) // 2,
        )
        actual_conversions = int(item["converted_count"])
        gap = max(target_conversions - actual_conversions, 0)
        status = "on_track"
        if gap >= 2 or (int(item["overdue_count"]) > 0 and actual_conversions == 0):
            status = "behind"
        elif gap >= 1 or int(item["due_today_count"]) > 0:
            status = "at_risk"
        owner_targets.append(
            {
                "owner_label": str(item["label"]),
                "target_conversions": target_conversions,
                "actual_conversions": actual_conversions,
                "gap": gap,
                "status": status,
            }
        )
    owner_targets.sort(
        key=lambda item: (
            {"behind": 0, "at_risk": 1, "on_track": 2}.get(str(item["status"]), 99),
            -int(item["gap"]),
            str(item["owner_label"]),
        )
    )

    current_window_start = today_date - timedelta(days=6)
    previous_window_start = today_date - timedelta(days=13)
    previous_window_end = today_date - timedelta(days=7)
    current_window_converted_count = 0
    previous_window_converted_count = 0
    owner_throughput_map: dict[str, dict[str, str | int]] = {}
    for lead in leads:
        converted_date = _parse_iso_date(lead.converted_at)
        if converted_date is None:
            continue
        serialized = serialize_lead(lead, tenant_id)
        owner_label = str(serialized["owner_name"] or serialized["suggested_owner_name"] or "Sem owner")
        group = owner_throughput_map.setdefault(
            owner_label,
            {
                "owner_label": owner_label,
                "current_window_count": 0,
                "previous_window_count": 0,
                "delta": 0,
                "direction": "stable",
            },
        )
        if converted_date >= current_window_start:
            current_window_converted_count += 1
            group["current_window_count"] = int(group["current_window_count"]) + 1
        elif previous_window_start <= converted_date <= previous_window_end:
            previous_window_converted_count += 1
            group["previous_window_count"] = int(group["previous_window_count"]) + 1
    throughput_delta = current_window_converted_count - previous_window_converted_count
    throughput_direction = "stable"
    if throughput_delta > 0:
        throughput_direction = "up"
    elif throughput_delta < 0:
        throughput_direction = "down"
    throughput_comparison = {
        "current_window_label": "Ultimos 7 dias",
        "current_window_count": current_window_converted_count,
        "previous_window_label": "7 dias anteriores",
        "previous_window_count": previous_window_converted_count,
        "delta": throughput_delta,
        "direction": throughput_direction,
        "summary": (
            f"Conversao nos ultimos 7 dias: {current_window_converted_count}. "
            f"Janela anterior: {previous_window_converted_count}. Delta {throughput_delta}."
        ),
    }
    owner_throughput = []
    for group in owner_throughput_map.values():
        delta = int(group["current_window_count"]) - int(group["previous_window_count"])
        direction = "stable"
        if delta > 0:
            direction = "up"
        elif delta < 0:
            direction = "down"
        owner_throughput.append(
            {
                "owner_label": str(group["owner_label"]),
                "current_window_count": int(group["current_window_count"]),
                "previous_window_count": int(group["previous_window_count"]),
                "delta": delta,
                "direction": direction,
            }
        )
    owner_throughput.sort(
        key=lambda item: (
            -int(item["delta"]),
            -int(item["current_window_count"]),
            str(item["owner_label"]),
        )
    )
    owner_health = []
    for target in owner_targets:
        throughput_item = next(
            (
                item
                for item in owner_throughput
                if str(item["owner_label"]) == str(target["owner_label"])
            ),
            None,
        )
        productivity_item = next(
            (
                item
                for item in owner_productivity
                if str(item["label"]) == str(target["owner_label"])
            ),
            None,
        )
        health_score = 100
        health_score -= int(target["gap"]) * 14
        health_score -= int(productivity_item["overdue_count"]) * 18 if productivity_item else 0
        health_score += max(int(throughput_item["delta"]), 0) * 8 if throughput_item else 0
        health_score -= max(-int(throughput_item["delta"]), 0) * 10 if throughput_item else 0
        health_score = max(18, min(health_score, 100))
        pressure_label = "steady"
        if health_score <= 44:
            pressure_label = "critical"
        elif health_score <= 68:
            pressure_label = "attention"
        owner_health.append(
            {
                "owner_label": str(target["owner_label"]),
                "health_score": health_score,
                "pressure_label": pressure_label,
                "overdue_count": int(productivity_item["overdue_count"]) if productivity_item else 0,
                "target_gap": int(target["gap"]),
                "throughput_delta": int(throughput_item["delta"]) if throughput_item else 0,
            }
        )
    owner_health.sort(
        key=lambda item: (
            int(item["health_score"]),
            -int(item["overdue_count"]),
            -int(item["target_gap"]),
            str(item["owner_label"]),
        )
    )
    recovery_queue = []
    for item in pending_leads:
        reason = None
        if str(item["follow_up_bucket"]) == "overdue":
            reason = "Follow-up fora do SLA"
        elif str(item["priority_label"]) in {"high", "critical"}:
            reason = "Lead com risco elevado"
        elif not item["owner_user_id"]:
            reason = "Lead sem owner definido"
        if reason is None:
            continue
        recommended_action = "Definir owner e janela"
        if str(item["follow_up_bucket"]) == "overdue":
            recommended_action = "Executar contato ainda hoje"
        elif not item["owner_user_id"]:
            recommended_action = "Atribuir owner sugerido"
        recovery_queue.append(
            {
                "lead_id": str(item["id"]),
                "lead_name": str(item["name"]),
                "owner_label": str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner"),
                "reason": reason,
                "recommended_action": recommended_action,
            }
        )
    recovery_queue = recovery_queue[:5]
    window_pressure_map: dict[str, dict[str, object]] = {}
    for item in pending_leads:
        window_label = follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda")
        group = window_pressure_map.setdefault(
            window_label,
            {
                "window_label": window_label,
                "leads_count": 0,
                "high_risk_count": 0,
                "owners": set(),
                "pressure_label": "steady",
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if str(item["priority_label"]) in {"high", "critical"}:
            group["high_risk_count"] = int(group["high_risk_count"]) + 1
        owners = group["owners"]
        if isinstance(owners, set):
            owners.add(str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner"))
    window_pressure = []
    for group in window_pressure_map.values():
        pressure_label = "steady"
        if str(group["window_label"]) == "Atrasado" or int(group["high_risk_count"]) >= 2:
            pressure_label = "critical"
        elif int(group["leads_count"]) >= 2 or int(group["high_risk_count"]) >= 1:
            pressure_label = "attention"
        window_pressure.append(
            {
                "window_label": str(group["window_label"]),
                "leads_count": int(group["leads_count"]),
                "high_risk_count": int(group["high_risk_count"]),
                "owners_involved": len(group["owners"]) if isinstance(group["owners"], set) else 0,
                "pressure_label": pressure_label,
            }
        )
    window_pressure.sort(
        key=lambda item: (
            {"critical": 0, "attention": 1, "steady": 2}.get(str(item["pressure_label"]), 99),
            -int(item["high_risk_count"]),
            -int(item["leads_count"]),
            str(item["window_label"]),
        )
    )
    stable_owners = [item for item in owner_health if str(item["pressure_label"]) == "steady"]
    stressed_owners = {
        str(item["owner_label"]): item for item in owner_health if str(item["pressure_label"]) != "steady"
    }
    rebalance_suggestions = []
    for item in recovery_queue:
        target_owner = stable_owners[0] if stable_owners else None
        owner_label = str(item["owner_label"])
        if target_owner is None:
            continue
        if owner_label != "Sem owner" and owner_label not in stressed_owners:
            continue
        reason = (
            f"{item['lead_name']} precisa sair de {owner_label} para aliviar a fila critica."
            if owner_label != "Sem owner"
            else f"{item['lead_name']} precisa ganhar dono para entrar na cadencia."
        )
        rebalance_suggestions.append(
            {
                "from_owner_label": owner_label,
                "to_owner_label": str(target_owner["owner_label"]),
                "lead_name": str(item["lead_name"]),
                "reason": reason,
            }
        )
    rebalance_suggestions = rebalance_suggestions[:4]
    owner_capacity = []
    for group in commercial_owner_groups:
        owner_label = str(group["label"])
        available_capacity = max(
            0,
            4 - int(group["leads_count"]) - int(group["overdue_count"]),
        )
        load_label = "balanced"
        if available_capacity == 0 or owner_label in stressed_owners:
            load_label = "overloaded"
        elif available_capacity >= 2:
            load_label = "available"
        recommended_window = "Esta semana"
        if int(group["overdue_count"]) > 0:
            recommended_window = "Apos limpar atrasos"
        elif int(group["due_today_count"]) > 0:
            recommended_window = "Apos a fila de hoje"
        elif available_capacity >= 2:
            recommended_window = "Hoje"
        owner_capacity.append(
            {
                "owner_label": owner_label,
                "active_queue_count": int(group["leads_count"]),
                "overdue_count": int(group["overdue_count"]),
                "due_today_count": int(group["due_today_count"]),
                "available_capacity": available_capacity,
                "load_label": load_label,
                "recommended_window": recommended_window,
            }
        )
    owner_capacity.sort(
        key=lambda item: (
            {"available": 0, "balanced": 1, "overloaded": 2}.get(str(item["load_label"]), 99),
            -int(item["available_capacity"]),
            int(item["overdue_count"]),
            str(item["owner_label"]),
        )
    )
    assignment_suggestions = []
    candidate_owners = [item for item in owner_capacity if int(item["available_capacity"]) > 0]
    for item in recovery_queue:
        target_owner = next(
            (
                owner
                for owner in candidate_owners
                if str(owner["owner_label"]) != str(item["owner_label"])
            ),
            candidate_owners[0] if candidate_owners else None,
        )
        if target_owner is None:
            continue
        assignment_suggestions.append(
            {
                "lead_name": str(item["lead_name"]),
                "from_owner_label": str(item["owner_label"]),
                "to_owner_label": str(target_owner["owner_label"]),
                "recommended_window": str(target_owner["recommended_window"]),
                "reason": (
                    f"{target_owner['owner_label']} tem capacidade para absorver o caso "
                    f"com janela {target_owner['recommended_window']}."
                ),
            }
        )
    assignment_suggestions = assignment_suggestions[:4]
    owner_daily_plan = []
    for capacity in owner_capacity[:4]:
        owner_label = str(capacity["owner_label"])
        owner_items = [
            item
            for item in pending_leads
            if str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner") == owner_label
        ]
        focus_today = "Revisar fila comercial"
        priority_reason = "Fila equilibrada para o dia."
        if owner_items:
            lead = owner_items[0]
            follow_up_bucket = str(lead["follow_up_bucket"])
            if follow_up_bucket == "overdue":
                focus_today = f"Destravar {lead['name']} ainda hoje"
                priority_reason = "Existe atraso comercial na primeira posicao da fila."
            elif follow_up_bucket == "today":
                focus_today = f"Fechar retorno de {lead['name']}"
                priority_reason = "A janela de follow-up vence hoje."
            elif not lead["owner_user_id"]:
                focus_today = f"Assumir owner de {lead['name']}"
                priority_reason = "Ha lead sem owner pedindo definicao imediata."
            else:
                focus_today = f"Avancar {lead['name']} na proxima rodada"
                priority_reason = "A fila ja tem owner e precisa manter cadencia."
        owner_daily_plan.append(
            {
                "owner_label": owner_label,
                "focus_today": focus_today,
                "queue_size": int(capacity["active_queue_count"]),
                "next_window": str(capacity["recommended_window"]),
                "priority_reason": priority_reason,
            }
        )
    window_allocation_plan = []
    for window_item in window_pressure[:5]:
        matching_leads = [
            item
            for item in pending_leads
            if follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda")
            == str(window_item["window_label"])
        ]
        primary_owner_label = (
            str(matching_leads[0]["owner_name"] or matching_leads[0]["suggested_owner_name"] or "Sem owner")
            if matching_leads
            else "Sem owner"
        )
        plan_summary = (
            f"{window_item['window_label']} concentra {window_item['leads_count']} lead(s) "
            f"com {window_item['high_risk_count']} em risco."
        )
        if matching_leads:
            plan_summary = (
                f"{primary_owner_label} puxa {matching_leads[0]['name']} e abre a janela "
                f"{window_item['window_label'].lower()}."
            )
        window_allocation_plan.append(
            {
                "window_label": str(window_item["window_label"]),
                "focus_count": int(window_item["leads_count"]),
                "primary_owner_label": primary_owner_label,
                "plan_summary": plan_summary,
            }
        )
    stage_labels = {
        "captured": "Captado",
        "qualified": "Qualificado",
        "follow_up": "Em follow-up",
        "proposal": "Proposta",
    }
    stage_forecast_map: dict[str, dict[str, int | str]] = {}
    for item in pending_leads:
        stage_label = stage_labels.get(str(item["stage"]), "Captado")
        group = stage_forecast_map.setdefault(
            stage_label,
            {
                "stage_label": stage_label,
                "leads_count": 0,
                "high_priority_count": 0,
                "expected_conversions": 0,
            },
        )
        group["leads_count"] = int(group["leads_count"]) + 1
        if str(item["priority_label"]) in {"high", "critical"}:
            group["high_priority_count"] = int(group["high_priority_count"]) + 1
        weight = 0
        if str(item["stage"]) == "proposal":
            weight = 1
        elif str(item["stage"]) == "follow_up" and str(item["follow_up_bucket"]) in {"today", "overdue"}:
            weight = 1
        elif str(item["stage"]) == "qualified" and str(item["priority_label"]) == "critical":
            weight = 1
        group["expected_conversions"] = int(group["expected_conversions"]) + weight
    stage_order = {
        "Proposta": 0,
        "Em follow-up": 1,
        "Qualificado": 2,
        "Captado": 3,
    }
    stage_forecast = sorted(
        stage_forecast_map.values(),
        key=lambda item: (
            stage_order.get(str(item["stage_label"]), 99),
            -int(item["high_priority_count"]),
            -int(item["leads_count"]),
        ),
    )
    expected_conversions = sum(int(item["expected_conversions"]) for item in stage_forecast)
    committed_pipeline_count = len(
        [item for item in pending_leads if str(item["stage"]) in {"follow_up", "proposal"}]
    )
    proposal_count = len([item for item in pending_leads if str(item["stage"]) == "proposal"])
    overdue_risk_count = len(
        [
            item
            for item in pending_leads
            if str(item["follow_up_bucket"]) == "overdue"
            and str(item["priority_label"]) in {"high", "critical"}
        ]
    )
    forecast_band = "moderado"
    if expected_conversions >= 3:
        forecast_band = "forte"
    elif expected_conversions <= 1:
        forecast_band = "contido"
    conversion_forecast = {
        "window_label": "Proximos 7 dias",
        "expected_conversions": expected_conversions,
        "committed_pipeline_count": committed_pipeline_count,
        "forecast_band": forecast_band,
        "summary": (
            f"Janela dos proximos 7 dias com {expected_conversions} fechamento(s) esperado(s) "
            f"e {committed_pipeline_count} lead(s) no pipeline comprometido."
        ),
    }
    owner_stage_mix_map: dict[str, dict[str, int | str]] = {}
    for item in pending_leads:
        owner_label = str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner")
        group = owner_stage_mix_map.setdefault(
            owner_label,
            {
                "owner_label": owner_label,
                "captured_count": 0,
                "qualified_count": 0,
                "follow_up_count": 0,
                "proposal_count": 0,
            },
        )
        stage = str(item["stage"])
        if stage == "proposal":
            group["proposal_count"] = int(group["proposal_count"]) + 1
        elif stage == "follow_up":
            group["follow_up_count"] = int(group["follow_up_count"]) + 1
        elif stage == "qualified":
            group["qualified_count"] = int(group["qualified_count"]) + 1
        else:
            group["captured_count"] = int(group["captured_count"]) + 1
    owner_stage_mix = sorted(
        owner_stage_mix_map.values(),
        key=lambda item: (
            -int(item["proposal_count"]),
            -int(item["follow_up_count"]),
            -int(item["qualified_count"]),
            str(item["owner_label"]),
        ),
    )
    confidence_score = 46
    confidence_score += proposal_count * 12
    confidence_score += committed_pipeline_count * 6
    confidence_score -= overdue_risk_count * 10
    confidence_score = max(18, min(confidence_score, 96))
    confidence_label = "media"
    if confidence_score >= 74:
        confidence_label = "alta"
    elif confidence_score <= 40:
        confidence_label = "baixa"
    forecast_confidence = {
        "score": confidence_score,
        "label": confidence_label,
        "committed_pipeline_count": committed_pipeline_count,
        "proposal_count": proposal_count,
        "overdue_risk_count": overdue_risk_count,
        "summary": (
            f"Confianca {confidence_label} com {proposal_count} lead(s) em proposta, "
            f"{committed_pipeline_count} no pipeline comprometido e {overdue_risk_count} risco(s) vencido(s)."
        ),
    }
    weekly_target = max(2, memberships_count)
    gap_to_target = max(weekly_target - expected_conversions, 0)
    risk_label = "on_track"
    if gap_to_target >= 2:
        risk_label = "critical"
    elif gap_to_target >= 1:
        risk_label = "attention"
    goal_risk = {
        "weekly_target": weekly_target,
        "expected_conversions": expected_conversions,
        "gap_to_target": gap_to_target,
        "risk_label": risk_label,
        "summary": (
            f"Meta semanal de {weekly_target} fechamento(s), previsao atual de "
            f"{expected_conversions} e gap de {gap_to_target}."
        ),
    }
    pessimistic = max(expected_conversions - max(overdue_risk_count, 1), 0)
    optimistic = expected_conversions + max(proposal_count, 1)
    forecast_scenarios = [
        {
            "scenario_label": "Base",
            "expected_conversions": expected_conversions,
            "confidence_label": confidence_label,
            "summary": conversion_forecast["summary"],
        },
        {
            "scenario_label": "Pressionado",
            "expected_conversions": pessimistic,
            "confidence_label": "baixa" if overdue_risk_count > 0 else "media",
            "summary": (
                f"Se os riscos vencidos seguirem sem resposta, a semana cai para {pessimistic} "
                "fechamento(s)."
            ),
        },
        {
            "scenario_label": "Acelerado",
            "expected_conversions": optimistic,
            "confidence_label": "media" if confidence_label == "baixa" else "alta",
            "summary": (
                f"Se as propostas e follow-ups quentes virarem, a semana pode chegar a "
                f"{optimistic} fechamento(s)."
            ),
        },
    ]
    forecast_drivers = []
    if proposal_count > 0:
        forecast_drivers.append(
            {
                "label": "Propostas abertas",
                "impact": "positivo",
                "summary": f"{proposal_count} lead(s) em proposta sustentam a aceleracao da semana.",
            }
        )
    if committed_pipeline_count > 0:
        forecast_drivers.append(
            {
                "label": "Pipeline comprometido",
                "impact": "positivo",
                "summary": (
                    f"{committed_pipeline_count} lead(s) estao em follow-up ou proposta, "
                    "o que aumenta previsibilidade de fechamento."
                ),
            }
        )
    if confidence_label == "alta":
        forecast_drivers.append(
            {
                "label": "Confianca alta",
                "impact": "positivo",
                "summary": "A distribuicao atual do funil sustenta previsao comercial mais confiavel.",
            }
        )
    forecast_blockers = []
    if overdue_risk_count > 0:
        forecast_blockers.append(
            {
                "label": "Riscos vencidos",
                "impact": "negativo",
                "summary": f"{overdue_risk_count} lead(s) de risco alto seguem com follow-up vencido.",
            }
        )
    if gap_to_target > 0:
        forecast_blockers.append(
            {
                "label": "Gap para meta",
                "impact": "negativo",
                "summary": f"Faltam {gap_to_target} fechamento(s) para bater a meta semanal atual.",
            }
        )
    if pending_leads_count > committed_pipeline_count:
        forecast_blockers.append(
            {
                "label": "Fila sem compromisso",
                "impact": "negativo",
                "summary": (
                    f"{pending_leads_count - committed_pipeline_count} lead(s) ainda estao fora "
                    "do pipeline comprometido."
                ),
            }
        )
    forecast_owner_label = (
        str(priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
        if priority_lead and (priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
        else "coordenacao comercial"
    )
    forecast_playbook = [
        {
            "scenario_label": "Pressionado",
            "move_label": "Estancar follow-ups vencidos",
            "owner_label": forecast_owner_label,
            "due_window": "hoje",
            "summary": (
                f"Responder {overdue_risk_count} risco(s) vencido(s) e puxar "
                f"{forecast_owner_label} para a frente da fila antes de redistribuir novos leads."
            ),
        },
        {
            "scenario_label": "Base",
            "move_label": "Blindar pipeline comprometido",
            "owner_label": forecast_owner_label,
            "due_window": "nas proximas 24 horas",
            "summary": (
                f"Proteger {committed_pipeline_count} lead(s) em follow-up ou proposta com "
                "cadencia, dono claro e proxima data definida."
            ),
        },
        {
            "scenario_label": "Acelerado",
            "move_label": "Empurrar propostas quentes",
            "owner_label": forecast_owner_label,
            "due_window": "esta semana",
            "summary": (
                f"Usar as {proposal_count} proposta(s) abertas para capturar o cenario de "
                f"{optimistic} fechamento(s) da janela."
            ),
        },
    ]
    daily_execution_queue = [
        {
            "lead_id": str(item["id"]),
            "lead_name": str(item["name"]),
            "owner_label": str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner"),
            "follow_up_label": follow_up_bucket_labels.get(str(item["follow_up_bucket"]), "Sem agenda"),
            "risk_score": int(item["risk_score"]),
        }
        for item in pending_leads[:5]
    ]
    owner_daily_briefs = []
    for group in commercial_owner_groups[:4]:
        owner_label = str(group["label"])
        owner_items = [
            item
            for item in pending_leads
            if str(item["owner_name"] or item["suggested_owner_name"] or "Sem owner") == owner_label
        ]
        first_item = owner_items[0] if owner_items else None
        first_action = "Manter cadencia do dia"
        if first_item is not None:
            follow_up_bucket = str(first_item["follow_up_bucket"])
            if follow_up_bucket == "overdue":
                first_action = f"Ligar para {first_item['name']} agora"
            elif follow_up_bucket == "today":
                first_action = f"Fechar follow-up de {first_item['name']} ainda hoje"
            elif follow_up_bucket == "unscheduled":
                first_action = f"Definir owner e data para {first_item['name']}"
            else:
                first_action = f"Avancar {first_item['name']} na proxima janela"
        owner_daily_briefs.append(
            {
                "owner_label": owner_label,
                "first_action": first_action,
                "brief": (
                    f"{owner_label} carrega {group['leads_count']} lead(s), "
                    f"{group['overdue_count']} atrasado(s) e {group['due_today_count']} para hoje."
                ),
            }
        )
    if daily_execution_queue:
        top_items = ", ".join(
            [
                f"{item['lead_name']} ({item['owner_label']})"
                for item in daily_execution_queue[:3]
            ]
        )
        morning_focus_summary = f"Primeira agenda do dia: {top_items}."
    else:
        morning_focus_summary = "Sem fila critica aberta para a primeira agenda do dia."

    return {
        "tenant_name": tenant.name,
        "contacts_count": len(contacts),
        "priority_contacts_count": len([contact for contact in contacts if contact.status == "priority"]),
        "leads_count": len(leads),
        "converted_leads_count": converted_leads_count,
        "pending_leads_count": pending_leads_count,
        "hot_leads_count": hot_leads_count,
        "overdue_followups_count": overdue_followups_count,
        "due_today_followups_count": due_today_followups_count,
        "critical_queue_count": critical_queue_count,
        "open_tasks_count": len([task for task in tasks if task.status != "done"]),
        "overdue_tasks_count": overdue_tasks_count,
        "opponents_count": len(opponents),
        "reports_count": len(reports),
        "memberships_count": memberships_count,
        "plan": subscription.plan,
        "trial_status": subscription.status,
        "priority_lead_id": str(priority_lead["id"]) if priority_lead else None,
        "priority_lead_name": str(priority_lead["name"]) if priority_lead else None,
        "priority_lead_owner_user_id": (
            str(priority_lead["owner_user_id"]) if priority_lead and priority_lead["owner_user_id"] else None
        ),
        "priority_lead_owner_name": (
            str(priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
            if priority_lead
            else None
        ),
        "priority_lead_suggested_owner_user_id": (
            str(priority_lead["suggested_owner_user_id"])
            if priority_lead and priority_lead["suggested_owner_user_id"]
            else None
        ),
        "priority_lead_has_owner": bool(priority_lead["owner_user_id"]) if priority_lead else False,
        "priority_lead_follow_up_label": (
            follow_up_bucket_labels.get(str(priority_lead["follow_up_bucket"]), "Sem agenda")
            if priority_lead
            else None
        ),
        "priority_lead_risk_score": int(priority_lead["risk_score"]) if priority_lead else 0,
        "commercial_owner_groups": commercial_owner_groups[:4],
        "commercial_window_groups": commercial_window_groups[:5],
        "owner_alerts": owner_alerts[:4],
        "daily_execution_queue": daily_execution_queue,
        "owner_productivity": owner_productivity[:4],
        "window_productivity": window_productivity[:5],
        "owner_targets": owner_targets[:4],
        "throughput_comparison": throughput_comparison,
        "owner_throughput": owner_throughput[:4],
        "owner_health": owner_health[:4],
        "recovery_queue": recovery_queue,
        "window_pressure": window_pressure[:5],
        "rebalance_suggestions": rebalance_suggestions,
        "owner_capacity": owner_capacity[:4],
        "assignment_suggestions": assignment_suggestions,
        "owner_daily_plan": owner_daily_plan,
        "window_allocation_plan": window_allocation_plan,
        "stage_forecast": stage_forecast,
        "conversion_forecast": conversion_forecast,
        "owner_stage_mix": owner_stage_mix[:4],
        "forecast_confidence": forecast_confidence,
        "goal_risk": goal_risk,
        "forecast_scenarios": forecast_scenarios,
        "forecast_drivers": forecast_drivers[:3],
        "forecast_blockers": forecast_blockers[:3],
        "forecast_playbook": forecast_playbook,
        "morning_focus_summary": morning_focus_summary,
        "owner_daily_briefs": owner_daily_briefs,
        "next_action": next_action,
    }
