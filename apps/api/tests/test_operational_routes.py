from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _get_access_token() -> str:
    response = client.post(
        "/auth/login",
        json={"email": "owner@pulso.local", "password": "Admin1234"},
    )
    assert response.status_code == 200
    return response.json()["tokens"]["access_token"]


def test_contacts_tasks_reports_flow() -> None:
    token = _get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    contact_response = client.post(
        "/contacts",
        headers=headers,
        json={
            "name": "Lideranca Bairro Centro",
            "kind": "leadership",
            "status": "new",
            "city": "Sao Paulo",
            "tags": ["bairro", "centro"],
        },
    )
    assert contact_response.status_code == 201
    contact_id = contact_response.json()["id"]

    update_contact_response = client.patch(
        f"/contacts/{contact_id}",
        headers=headers,
        json={"status": "priority"},
    )
    assert update_contact_response.status_code == 200
    assert update_contact_response.json()["status"] == "priority"

    note_response = client.post(
        f"/contacts/{contact_id}/notes",
        headers=headers,
        json={"content": "Contato visitado na reuniao regional."},
    )
    assert note_response.status_code == 200
    assert note_response.json()["note_history"][0]["content"] == "Contato visitado na reuniao regional."

    task_response = client.post(
        "/tasks",
        headers=headers,
        json={"title": "Marcar reuniao com liderancas", "priority": "high"},
    )
    assert task_response.status_code == 201
    task_id = task_response.json()["id"]

    patch_response = client.patch(
        f"/tasks/{task_id}",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "in_progress"

    report_response = client.post(
        "/reports",
        headers=headers,
        json={"title": "Resumo semanal", "report_type": "operational"},
    )
    assert report_response.status_code == 201
    report_id = report_response.json()["id"]
    assert report_response.json()["metrics"]["contacts_count"] >= 1

    export_response = client.post(f"/reports/{report_id}/export/pdf", headers=headers)
    assert export_response.status_code == 200
    assert "Watermark" in export_response.json()["content"]

    export_csv_response = client.post(f"/reports/{report_id}/export/csv", headers=headers)
    assert export_csv_response.status_code == 200
    assert "contacts_count" in export_csv_response.json()["content"]

    filtered_reports_response = client.get("/reports?report_type=operational", headers=headers)
    assert filtered_reports_response.status_code == 200
    assert all(item["report_type"] == "operational" for item in filtered_reports_response.json())

    filtered_contacts_response = client.get("/contacts?query=Centro", headers=headers)
    assert filtered_contacts_response.status_code == 200
    assert len(filtered_contacts_response.json()) >= 1

    filtered_contacts_by_status_response = client.get("/contacts?status=priority", headers=headers)
    assert filtered_contacts_by_status_response.status_code == 200
    assert all(item["status"] == "priority" for item in filtered_contacts_by_status_response.json())

    filtered_contacts_by_tag_response = client.get("/contacts?tag=centro", headers=headers)
    assert filtered_contacts_by_tag_response.status_code == 200
    assert len(filtered_contacts_by_tag_response.json()) >= 1

    filtered_contacts_by_city_response = client.get("/contacts?city=sao", headers=headers)
    assert filtered_contacts_by_city_response.status_code == 200
    assert len(filtered_contacts_by_city_response.json()) >= 1

    filtered_contacts_by_history_response = client.get("/contacts?query=reuniao", headers=headers)
    assert filtered_contacts_by_history_response.status_code == 200
    assert len(filtered_contacts_by_history_response.json()) >= 1

    filtered_tasks_response = client.get("/tasks?status=in_progress", headers=headers)
    assert filtered_tasks_response.status_code == 200
    assert all(item["status"] == "in_progress" for item in filtered_tasks_response.json())


def test_onboarding_billing_and_dashboard_flow() -> None:
    token = _get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    onboarding_response = client.patch(
        "/onboarding",
        headers=headers,
        json={"profile_type": "campaign", "objective": "ativar workspace"},
    )
    assert onboarding_response.status_code == 200
    assert onboarding_response.json()["profile_type"] == "campaign"
    assert onboarding_response.json()["completed"] is False

    campaign_response = client.post(
        "/onboarding/campaigns",
        headers=headers,
        json={
            "name": "Campanha Centro 2026",
            "office": "Vereador",
            "city": "Sao Paulo",
            "state": "SP",
            "phase": "campaign",
        },
    )
    assert campaign_response.status_code == 201

    invite_response = client.post(
        "/memberships/invite",
        headers=headers,
        json={
            "email": "coordenacao.onboarding@example.com",
            "full_name": "Coordenacao Onboarding",
            "role": "coordinator",
        },
    )
    assert invite_response.status_code == 201

    opponent_response = client.post(
        "/opponents",
        headers=headers,
        json={
            "name": "Adversario Centro",
            "context": "Base forte no centro expandido",
            "stance": "incumbent",
            "watch_level": "critical",
            "links": ["https://example.com/adversario"],
            "notes": "Primeiro registro do onboarding",
            "tags": ["centro"],
        },
    )
    assert opponent_response.status_code == 201
    opponent_id = opponent_response.json()["id"]

    opponent_event_response = client.post(
        f"/opponents/{opponent_id}/events",
        headers=headers,
        json={
            "title": "Movimento de rua",
            "description": "Agenda intensificada no centro",
            "event_date": "2026-03-01",
            "severity": "critical",
        },
    )
    assert opponent_event_response.status_code == 201

    filtered_opponents_response = client.get(
        "/opponents?query=centro&tag=centro&stance=incumbent&watch_level=critical",
        headers=headers,
    )
    assert filtered_opponents_response.status_code == 200
    assert len(filtered_opponents_response.json()) >= 1

    filtered_events_response = client.get(
        f"/opponents/{opponent_id}/events?severity=critical",
        headers=headers,
    )
    assert filtered_events_response.status_code == 200
    assert all(item["severity"] == "critical" for item in filtered_events_response.json())

    opponents_summary_response = client.get("/opponents/summary", headers=headers)
    assert opponents_summary_response.status_code == 200
    assert opponents_summary_response.json()["total_opponents"] >= 1
    assert opponents_summary_response.json()["critical_events_count"] >= 1
    assert "momentum_delta" in opponents_summary_response.json()
    assert "spotlight" in opponents_summary_response.json()
    assert len(opponents_summary_response.json()["top_watchlist"]) >= 1

    state_response = client.get("/onboarding", headers=headers)
    assert state_response.status_code == 200
    assert state_response.json()["campaign_id"] == campaign_response.json()["id"]
    assert state_response.json()["team_configured"] is True
    assert state_response.json()["first_opponent_created"] is True
    assert state_response.json()["completed"] is True

    billing_response = client.post(
        "/billing/checkout",
        headers=headers,
        json={"plan": "pro"},
    )
    assert billing_response.status_code == 200
    assert "Plano pro" in billing_response.json()["message"]

    plans_response = client.get("/billing/plans", headers=headers)
    assert plans_response.status_code == 200
    assert len(plans_response.json()) >= 4

    subscription_response = client.get("/billing/subscription", headers=headers)
    assert subscription_response.status_code == 200
    assert "trial_days_remaining" in subscription_response.json()
    assert "suggested_plan" in subscription_response.json()
    assert subscription_response.json()["current_period_ends_at"] is not None
    assert subscription_response.json()["commercial_status"] == "ativo"
    assert subscription_response.json()["collection_stage"] == "healthy"
    assert subscription_response.json()["failed_payments_count"] == 0
    assert subscription_response.json()["seat_usage_count"] >= 1
    assert subscription_response.json()["renewal_risk"] in {"low", "medium", "high", "critical"}
    assert subscription_response.json()["recommended_billing_cycle"] in {"monthly", "annual"}

    cancel_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "cancel"},
    )
    assert cancel_response.status_code == 200
    canceled_subscription_response = client.get("/billing/subscription", headers=headers)
    assert canceled_subscription_response.status_code == 200
    assert canceled_subscription_response.json()["cancel_at_period_end"] is True
    assert canceled_subscription_response.json()["commercial_status"] == "cancelamento_agendado"

    reactivate_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "reactivate"},
    )
    assert reactivate_response.status_code == 200

    past_due_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "mark_past_due"},
    )
    assert past_due_response.status_code == 200
    past_due_subscription_response = client.get("/billing/subscription", headers=headers)
    assert past_due_subscription_response.status_code == 200
    assert past_due_subscription_response.json()["commercial_status"] == "em_graca"
    assert past_due_subscription_response.json()["collection_stage"] == "grace"
    assert past_due_subscription_response.json()["failed_payments_count"] >= 1
    assert past_due_subscription_response.json()["grace_period_ends_at"] is not None

    retry_charge_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "retry_charge"},
    )
    assert retry_charge_response.status_code == 200
    retry_subscription_response = client.get("/billing/subscription", headers=headers)
    assert retry_subscription_response.status_code == 200
    assert retry_subscription_response.json()["failed_payments_count"] >= 2
    assert retry_subscription_response.json()["last_payment_attempt_at"] is not None
    assert retry_subscription_response.json()["renewal_risk"] == "high"

    resolve_past_due_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "resolve_past_due"},
    )
    assert resolve_past_due_response.status_code == 200

    expire_subscription_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "expire_subscription"},
    )
    assert expire_subscription_response.status_code == 200
    canceled_subscription_state_response = client.get("/billing/subscription", headers=headers)
    assert canceled_subscription_state_response.status_code == 200
    assert canceled_subscription_state_response.json()["status"] == "canceled"
    assert canceled_subscription_state_response.json()["collection_stage"] == "churn"

    reactivate_after_expire_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "reactivate"},
    )
    assert reactivate_after_expire_response.status_code == 200

    annual_cycle_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "switch_to_annual"},
    )
    assert annual_cycle_response.status_code == 200
    annual_subscription_response = client.get("/billing/subscription", headers=headers)
    assert annual_subscription_response.status_code == 200
    assert annual_subscription_response.json()["billing_cycle"] == "annual"

    monthly_cycle_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "switch_to_monthly"},
    )
    assert monthly_cycle_response.status_code == 200
    monthly_subscription_response = client.get("/billing/subscription", headers=headers)
    assert monthly_subscription_response.status_code == 200
    assert monthly_subscription_response.json()["billing_cycle"] == "monthly"

    renew_trial_response = client.post(
        "/billing/subscription/action",
        headers=headers,
        json={"action": "renew_trial"},
    )
    assert renew_trial_response.status_code == 200

    billing_events_response = client.get("/billing/events", headers=headers)
    assert billing_events_response.status_code == 200
    assert len(billing_events_response.json()) >= 9
    assert any(item["action"] == "billing.subscription_mark_past_due" for item in billing_events_response.json())
    assert any(item["action"] == "billing.subscription_retry_charge" for item in billing_events_response.json())
    assert any(item["action"] == "billing.subscription_expire_subscription" for item in billing_events_response.json())
    assert any(item["action"] == "billing.subscription_switch_to_annual" for item in billing_events_response.json())
    assert any(item["action"] == "billing.subscription_switch_to_monthly" for item in billing_events_response.json())

    dashboard_response = client.get("/dashboard/summary", headers=headers)
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["plan"] == "pro"
    assert "next_action" in dashboard_response.json()
    assert "priority_contacts_count" in dashboard_response.json()
    assert "leads_count" in dashboard_response.json()
    assert "pending_leads_count" in dashboard_response.json()
    assert "overdue_followups_count" in dashboard_response.json()
    assert "critical_queue_count" in dashboard_response.json()
    assert "priority_lead_id" in dashboard_response.json()
    assert "priority_lead_name" in dashboard_response.json()
    assert "priority_lead_owner_name" in dashboard_response.json()
    assert isinstance(dashboard_response.json()["commercial_owner_groups"], list)
    assert isinstance(dashboard_response.json()["commercial_window_groups"], list)
    assert isinstance(dashboard_response.json()["owner_alerts"], list)
    assert isinstance(dashboard_response.json()["daily_execution_queue"], list)
    assert isinstance(dashboard_response.json()["owner_productivity"], list)
    assert isinstance(dashboard_response.json()["window_productivity"], list)
    assert isinstance(dashboard_response.json()["owner_targets"], list)
    assert "throughput_comparison" in dashboard_response.json()
    assert "current_window_label" in dashboard_response.json()["throughput_comparison"]
    assert "delta" in dashboard_response.json()["throughput_comparison"]
    assert isinstance(dashboard_response.json()["owner_throughput"], list)
    assert "morning_focus_summary" in dashboard_response.json()
    assert isinstance(dashboard_response.json()["owner_daily_briefs"], list)


def test_public_lead_capture() -> None:
    response = client.post(
        "/public/leads",
        json={
            "name": "Lead Comercial",
            "email": "lead.comercial@example.com",
            "phone": "11999999999",
            "role": "consultor",
            "city": "Campinas",
            "challenge": "Organizar operacao",
        },
    )
    assert response.status_code == 201
    assert response.json()["email"] == "lead.comercial@example.com"
    assert response.json()["follow_up_bucket"] == "unscheduled"
    assert response.json()["priority_label"] == "normal"
    assert response.json()["suggested_owner_user_id"] is None


def test_lead_can_be_converted_to_contact_once() -> None:
    capture_response = client.post(
        "/public/leads",
        json={
            "name": "Lead Convertivel",
            "email": "lead.convertivel@example.com",
            "phone": "11988887777",
            "role": "Articuladora",
            "city": "Santos",
            "challenge": "Estruturar cadencia de relacionamento",
            "source": "evento",
        },
    )
    assert capture_response.status_code == 201
    lead_id = capture_response.json()["id"]

    token = _get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    convert_response = client.post(f"/leads/{lead_id}/convert", headers=headers)
    assert convert_response.status_code == 200
    assert convert_response.json()["converted_contact_id"] is not None
    assert convert_response.json()["converted_at"] is not None
    assert convert_response.json()["stage"] == "converted"

    contacts_response = client.get("/contacts?query=lead.convertivel@example.com", headers=headers)
    assert contacts_response.status_code == 200
    assert len(contacts_response.json()) >= 1
    assert any(item["kind"] == "lead" for item in contacts_response.json())

    second_convert_response = client.post(f"/leads/{lead_id}/convert", headers=headers)
    assert second_convert_response.status_code == 409


def test_lead_pipeline_update_and_filters() -> None:
    capture_response = client.post(
        "/public/leads",
        json={
            "name": "Lead Pipeline",
            "email": "lead.pipeline@example.com",
            "phone": "11977776666",
            "role": "Coordenador regional",
            "city": "Sao Paulo",
            "challenge": "Organizar a fila comercial",
            "source": "website",
        },
    )
    assert capture_response.status_code == 201
    lead_id = capture_response.json()["id"]

    token = _get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    initial_list_response = client.get("/leads", headers=headers)
    assert initial_list_response.status_code == 200
    captured_lead = next(item for item in initial_list_response.json() if item["id"] == lead_id)
    assert captured_lead["follow_up_bucket"] == "unscheduled"
    assert captured_lead["suggested_owner_user_id"] is not None

    update_response = client.patch(
        f"/leads/{lead_id}",
        headers=headers,
        json={
            "stage": "follow_up",
            "owner_user_id": next(iter(client.get("/memberships", headers=headers).json()))["user_id"],
            "follow_up_at": "2026-03-01",
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["stage"] == "follow_up"
    assert update_response.json()["owner_name"] == "Owner Demo"
    assert update_response.json()["follow_up_at"] == "2026-03-01"
    assert update_response.json()["follow_up_bucket"] == "overdue"
    assert update_response.json()["risk_score"] >= 80
    assert update_response.json()["suggested_owner_user_id"] is None

    filtered_by_stage = client.get("/leads?stage=follow_up", headers=headers)
    assert filtered_by_stage.status_code == 200
    assert any(item["id"] == lead_id for item in filtered_by_stage.json())

    owner_user_id = update_response.json()["owner_user_id"]
    filtered_by_owner = client.get(f"/leads?owner_user_id={owner_user_id}", headers=headers)
    assert filtered_by_owner.status_code == 200
    assert any(item["id"] == lead_id for item in filtered_by_owner.json())

    dashboard_response = client.get("/dashboard/summary", headers=headers)
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["overdue_followups_count"] >= 1
    assert isinstance(dashboard_response.json()["owner_targets"], list)
    assert "throughput_comparison" in dashboard_response.json()
    assert isinstance(dashboard_response.json()["owner_throughput"], list)


def test_membership_invite_and_ai_summary() -> None:
    token = _get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    invite_response = client.post(
        "/memberships/invite",
        headers=headers,
        json={
            "email": "analista.time@example.com",
            "full_name": "Analista Time",
            "role": "analyst",
        },
    )
    assert invite_response.status_code == 201
    assert invite_response.json()["role"] == "analyst"

    memberships_response = client.get("/memberships", headers=headers)
    assert memberships_response.status_code == 200
    assert len(memberships_response.json()) >= 2
    invited_membership = next(
        item for item in memberships_response.json() if item["email"] == "analista.time@example.com"
    )

    role_update_response = client.patch(
        f"/memberships/{invited_membership['id']}/role",
        headers=headers,
        json={"role": "coordinator"},
    )
    assert role_update_response.status_code == 200
    assert role_update_response.json()["role"] == "coordinator"

    delete_response = client.delete(
        f"/memberships/{invited_membership['id']}",
        headers=headers,
    )
    assert delete_response.status_code == 204

    ai_response = client.get("/ai/summary", headers=headers)
    assert ai_response.status_code == 200
    assert "Resumo IA" in ai_response.json()["headline"]
    assert ai_response.json()["module"] == "dashboard"
    assert "next_action" in ai_response.json()
    assert "action_reason" in ai_response.json()
    assert ai_response.json()["urgency"] in {"normal", "high"}
    assert isinstance(ai_response.json()["priority_score"], int)
    assert ai_response.json()["trigger_signal"]
    assert ai_response.json()["focus_area"]
    assert ai_response.json()["suggested_owner"]
    assert ai_response.json()["due_window"]
    assert isinstance(ai_response.json()["blockers"], list)
    assert isinstance(ai_response.json()["supporting_signals"], list)
    assert len(ai_response.json()["supporting_signals"]) >= 1

    ai_contacts_response = client.get("/ai/summary?module=contacts", headers=headers)
    assert ai_contacts_response.status_code == 200
    assert ai_contacts_response.json()["module"] == "contacts"
    assert ai_contacts_response.json()["next_action"]

    ai_billing_response = client.get("/ai/summary?module=billing", headers=headers)
    assert ai_billing_response.status_code == 200
    assert ai_billing_response.json()["module"] == "billing"
    assert ai_billing_response.json()["suggested_owner"]
    assert ai_billing_response.json()["trigger_signal"]

    tenant_update_response = client.patch(
        "/tenants/current",
        headers=headers,
        json={"name": "Workspace Governanca"},
    )
    assert tenant_update_response.status_code == 200
    assert tenant_update_response.json()["name"] == "Workspace Governanca"
