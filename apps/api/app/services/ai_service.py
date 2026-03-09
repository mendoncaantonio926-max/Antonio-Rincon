from __future__ import annotations

from datetime import date

from app.services.dashboard_service import get_dashboard_summary
from app.services.crud_service import (
    build_opponents_summary,
    list_contacts,
    list_opponent_events,
    list_opponents,
    list_tasks,
)
from app.services.plan_service import get_subscription_for_tenant, get_trial_days_remaining
from app.services.public_service import serialize_lead
from app.services.report_service import list_reports
from app.services.store import store


def get_ai_summary(tenant_id: str, module: str = "dashboard") -> dict:
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    reports = list_reports(tenant_id)
    subscription = get_subscription_for_tenant(tenant_id)
    opponents_summary = build_opponents_summary(tenant_id)
    dashboard_summary = get_dashboard_summary(tenant_id)
    leads = list(store.leads.values())
    pending_lead_queue = [
        serialize_lead(lead, tenant_id) for lead in leads if not lead.converted_contact_id
    ]
    pending_lead_queue.sort(
        key=lambda item: (
            {"overdue": 0, "today": 1, "this_week": 2, "later": 3, "unscheduled": 4}.get(
                str(item["follow_up_bucket"]), 99
            ),
            -int(item["risk_score"]),
            str(item["follow_up_at"] or "9999-12-31"),
            str(item["created_at"]),
        )
    )
    priority_lead = pending_lead_queue[0] if pending_lead_queue else None
    pending_leads = len([lead for lead in leads if not lead.converted_contact_id])
    converted_leads = len(leads) - pending_leads
    overdue_followups = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at and lead.follow_up_at < date.today().isoformat()
        ]
    )
    due_today_followups = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.follow_up_at == date.today().isoformat()
        ]
    )
    hot_leads = len(
        [
            lead
            for lead in leads
            if not lead.converted_contact_id and lead.stage in {"qualified", "follow_up", "proposal"}
        ]
    )
    open_tasks = len([task for task in tasks if task.status != "done"])
    priority_contacts = len([contact for contact in contacts if contact.status == "priority"])
    overdue_tasks = len(
        [
            task
            for task in tasks
            if task.status != "done" and task.due_date and task.due_date < date.today().isoformat()
        ]
    )
    opponent_events = sum(len(list_opponent_events(tenant_id, opponent.id)) for opponent in opponents)
    critical_events = sum(
        len(list_opponent_events(tenant_id, opponent.id, severity="critical")) for opponent in opponents
    )
    onboarding_state = next(
        (item for item in store.onboarding_states.values() if item.tenant_id == tenant_id),
        None,
    )
    trial_days_remaining = get_trial_days_remaining(subscription)
    module = module if module in {"dashboard", "contacts", "tasks", "opponents", "billing"} else "dashboard"
    owner_health = dashboard_summary.get("owner_health", [])
    recovery_queue = dashboard_summary.get("recovery_queue", [])
    critical_owner = next(
        (
            item
            for item in owner_health
            if isinstance(item, dict) and item.get("pressure_label") == "critical"
        ),
        None,
    )
    first_recovery = recovery_queue[0] if recovery_queue and isinstance(recovery_queue[0], dict) else None

    next_action = "Consolidar rotina semanal"
    action_reason = "O workspace esta funcional e pede manutencao de cadencia, leitura executiva e revisao de prioridades."
    urgency = "normal"
    priority_score = 34
    trigger_signal = "cadencia operacional sob controle"
    focus_area = "cadencia executiva"
    suggested_owner = "coordenacao"
    due_window = "nesta semana"

    recommendations: list[str] = []
    blockers: list[str] = []
    supporting_signals = [
        f"{len(contacts)} contato(s) ativos no workspace.",
        f"{pending_leads} lead(s) aguardando conversao, {hot_leads} quentes e {converted_leads} ja convertidos.",
        f"{open_tasks} tarefa(s) em aberto e {overdue_tasks} vencida(s).",
        f"{len(opponents)} adversario(s) e {critical_events} sinal(is) critico(s) monitorado(s).",
    ]
    if critical_owner:
        supporting_signals.insert(
            0,
            (
                f"Owner sob pressao: {critical_owner['owner_label']} com score "
                f"{critical_owner['health_score']}, gap {critical_owner['target_gap']} "
                f"e {critical_owner['overdue_count']} atraso(s)."
            ),
        )
        recommendations.insert(
            0,
            "Reequilibre a fila do owner mais pressionado antes de distribuir novos leads.",
        )
        blockers.insert(
            0,
            "Existe owner comercial com saude critica puxando atraso e gap de meta.",
        )
        if module == "dashboard" and urgency != "high":
            next_action = "Recuperar owner sob pressao"
            action_reason = (
                f"{critical_owner['owner_label']} concentra atraso comercial e gap de meta, "
                "o que pede rebalanceamento imediato da fila."
            )
            urgency = "high"
            priority_score = max(priority_score, 84)
            trigger_signal = (
                f"{critical_owner['owner_label']} com score {critical_owner['health_score']} "
                f"e {critical_owner['overdue_count']} atraso(s)"
            )
            focus_area = "gestao comercial"
            suggested_owner = "coordenacao comercial"
            due_window = "hoje"
    if first_recovery:
        supporting_signals.insert(
            0,
            (
                f"Fila de recuperacao aberta por {first_recovery['lead_name']}: "
                f"{first_recovery['reason']}."
            ),
        )
    if overdue_followups > 0 and module in {"dashboard", "contacts"}:
        focus_lead_name = str(priority_lead["name"]) if priority_lead else "a fila comercial"
        focus_owner = (
            str(priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
            if priority_lead
            else "comercial"
        )
        focus_bucket = str(priority_lead["follow_up_bucket"]) if priority_lead else "overdue"
        next_action = "Regularizar follow-ups atrasados"
        action_reason = (
            f"Ha {overdue_followups} lead(s) com follow-up fora do SLA comercial. {focus_lead_name} deve puxar a resposta imediata."
        )
        urgency = "high"
        priority_score = max(priority_score, 87)
        trigger_signal = f"{overdue_followups} follow-up(s) atrasado(s), com foco em {focus_lead_name}"
        focus_area = "sla comercial"
        suggested_owner = focus_owner
        due_window = "hoje" if focus_bucket in {"overdue", "today"} else "nas proximas 24 horas"
        recommendations.insert(
            0,
            "Existem follow-ups atrasados no funil. Reorganize a abordagem antes de abrir novas frentes comerciais.",
        )
        blockers.insert(0, "O funil comercial tem follow-ups fora do SLA combinado.")
        supporting_signals.insert(
            0,
            f"Lead prioritario: {focus_lead_name}, owner sugerido: {focus_owner}.",
        )
    if pending_leads > 0 and module in {"dashboard", "contacts"} and urgency != "high":
        focus_lead_name = str(priority_lead["name"]) if priority_lead else "a fila comercial"
        focus_owner = (
            str(priority_lead["owner_name"] or priority_lead["suggested_owner_name"])
            if priority_lead
            else "comercial e articulacao"
        )
        focus_bucket = (
            str(priority_lead["follow_up_bucket"]).replace("_", " ") if priority_lead else "sem agenda"
        )
        next_action = "Converter leads captados em contato"
        action_reason = (
            f"Ha {pending_leads} lead(s) aguardando triagem comercial. {focus_lead_name} deve sair primeiro para destravar a fila."
        )
        urgency = "normal"
        priority_score = max(priority_score, 66)
        trigger_signal = f"{pending_leads} lead(s) pendente(s), com foco em {focus_lead_name}"
        focus_area = "conversao comercial"
        suggested_owner = focus_owner
        due_window = "nas proximas 24 horas" if focus_bucket != "later" else "esta semana"
        recommendations.append(
            "Leads captados ainda nao viraram contatos. Converta a fila quente para preservar contexto e velocidade."
        )
        blockers.append("A fila comercial tem leads sem conversao para o CRM.")
        supporting_signals.insert(
            0,
            f"Primeiro lead da fila: {focus_lead_name}, janela: {focus_bucket}, owner sugerido: {focus_owner}.",
        )
    if overdue_tasks > 0:
        next_action = "Resolver tarefas vencidas"
        action_reason = f"Ha {overdue_tasks} tarefa(s) fora do prazo, o que compromete execucao e previsibilidade operacional."
        urgency = "high"
        priority_score = max(priority_score, 82)
        trigger_signal = f"{overdue_tasks} tarefa(s) vencida(s)"
        focus_area = "execucao critica"
        suggested_owner = "operacoes"
        due_window = "hoje"
        recommendations.append(
            f"Existem {overdue_tasks} tarefa(s) vencida(s). Reordene a fila antes de abrir novas frentes."
        )
        blockers.append("Ha backlog vencido comprometendo previsibilidade de entrega.")
    if priority_contacts == 0 and contacts:
        if module in {"dashboard", "contacts"} and urgency != "high":
            next_action = "Classificar contatos prioritarios"
            action_reason = "A base ja existe, mas ainda nao orienta a coordenacao porque faltam prioridades explicitas."
            urgency = "normal"
            priority_score = max(priority_score, 58)
            trigger_signal = "base sem priorizacao"
            focus_area = "qualificacao de base"
            suggested_owner = "articulacao territorial"
            due_window = "nas proximas 48 horas"
        recommendations.append("Nenhum contato esta marcado como prioritario. Classifique a base para orientar a coordenacao.")
        blockers.append("A base de contatos ainda nao diferencia prioridades reais de acompanhamento.")
    if not contacts:
        if module in {"dashboard", "contacts"}:
            next_action = "Cadastrar contatos estrategicos"
            action_reason = "Sem base inicial de contatos, o CRM nao consegue puxar territorio, liderancas nem imprensa."
            urgency = "high"
            priority_score = max(priority_score, 88)
            trigger_signal = "crm ainda vazio"
            focus_area = "ativacao de CRM"
            suggested_owner = "articulacao territorial"
            due_window = "hoje"
        recommendations.append("Cadastre os primeiros contatos estrategicos para ativar o CRM politico.")
        blockers.append("O CRM ainda nao tem base minima para puxar relacao politica.")
    if not opponents:
        if module in {"dashboard", "opponents"} and urgency != "high":
            next_action = "Abrir monitoramento de adversarios"
            action_reason = "Ainda nao ha adversarios mapeados, entao o workspace opera sem leitura competitiva minima."
            urgency = "normal"
            priority_score = max(priority_score, 52)
            trigger_signal = "monitoramento ainda nao iniciado"
            focus_area = "leitura competitiva"
            suggested_owner = "inteligencia"
            due_window = "nesta semana"
        recommendations.append("Cadastre ao menos um adversario para iniciar o monitoramento.")
        blockers.append("O modulo de monitoramento ainda nao tem nenhum adversario ativo.")
    if critical_events > 0:
        if module in {"dashboard", "opponents"}:
            next_action = "Responder sinais criticos da timeline"
            action_reason = f"Foram detectados {critical_events} evento(s) critico(s), o que pede resposta coordenada e material executivo."
            urgency = "high"
            priority_score = max(priority_score, 86)
            trigger_signal = f"{critical_events} sinal(is) critico(s) na timeline"
            focus_area = "resposta coordenada"
            suggested_owner = "inteligencia e comunicacao"
            due_window = "nas proximas 24 horas"
        recommendations.append(
            f"Ha {critical_events} evento(s) critico(s) na timeline. Vale converter isso em relatorio executivo."
        )
        blockers.append("A timeline registra sinais criticos que ainda pedem resposta coordenada.")
    if not reports:
        if module in {"dashboard"} and urgency == "normal":
            next_action = "Gerar relatorio executivo"
            action_reason = "O workspace ja acumula atividade, mas ainda nao a consolidou em material de coordenacao."
            priority_score = max(priority_score, 49)
            trigger_signal = "falta consolidacao executiva"
            focus_area = "consolidacao executiva"
            suggested_owner = "coordenacao"
            due_window = "ate o fim da semana"
        recommendations.append("Ainda nao ha relatorios gerados. Crie um resumo executivo para consolidar o ciclo atual.")
        blockers.append("Ainda nao existe material executivo consolidando a operacao.")
    if onboarding_state and not onboarding_state.completed:
        if module == "dashboard":
            next_action = "Fechar onboarding operacional"
            action_reason = "A ativacao inicial ainda nao terminou, o que reduz o contexto disponivel para decisao e rotina."
            urgency = "high"
            priority_score = max(priority_score, 91)
            trigger_signal = "ativacao inicial incompleta"
            focus_area = "ativacao inicial"
            suggested_owner = "owner do workspace"
            due_window = "hoje"
        recommendations.append("O onboarding ainda nao foi concluido. Termine a ativacao para destravar o uso operacional completo.")
        blockers.append("A ativacao inicial do workspace ainda nao foi concluida.")
    if subscription.status == "past_due":
        next_action = "Regularizar pendencia comercial"
        action_reason = "A assinatura esta em pendencia financeira e pode travar continuidade de uso e expansao."
        urgency = "high"
        priority_score = 95
        trigger_signal = "pendencia comercial ativa"
        focus_area = "continuidade comercial"
        suggested_owner = "financeiro e decisao comercial"
        due_window = "imediatamente"
        recommendations.append("A conta esta em pendencia financeira. Resolva isso antes de ampliar o uso do workspace.")
        blockers.append("Ha pendencia comercial ativa na assinatura.")
    elif subscription.cancel_at_period_end and module == "dashboard" and urgency != "high":
        next_action = "Reavaliar risco de cancelamento"
        action_reason = "Existe cancelamento agendado, entao convem confirmar renovacao, entrega percebida e plano correto."
        urgency = "normal"
        priority_score = max(priority_score, 68)
        trigger_signal = "cancelamento agendado"
        focus_area = "retencao"
        suggested_owner = "comercial"
        due_window = "neste ciclo"
        recommendations.append("Ha cancelamento agendado para o fim do periodo. Reforce entrega e revise o plano adequado.")
        blockers.append("Existe cancelamento agendado para o fim do periodo atual.")
    elif subscription.status == "trialing" and trial_days_remaining <= 5 and module == "dashboard" and urgency != "high":
        next_action = "Converter trial em plano ativo"
        action_reason = f"O trial termina em {trial_days_remaining} dia(s), entao a conversa comercial precisa acontecer agora."
        urgency = "normal"
        priority_score = max(priority_score, 63)
        trigger_signal = f"trial termina em {trial_days_remaining} dia(s)"
        focus_area = "conversao comercial"
        suggested_owner = "comercial"
        due_window = "antes do fim do trial"
        recommendations.append("O trial esta perto do fim. Prepare conversao ou ajuste de plano antes do vencimento.")
        blockers.append("O trial esta perto do fim e exige decisao comercial.")
    if (
        module in {"dashboard", "opponents"}
        and opponents_summary["momentum_direction"] == "up"
        and opponents_summary["critical_events_count"] > 0
    ):
        next_action = "Produzir resposta competitiva com base no spotlight"
        action_reason = (
            f"{opponents_summary['spotlight']['name']} acelerou o ritmo competitivo "
            f"com delta {opponents_summary['spotlight']['momentum_delta']} e sinais criticos recentes."
        )
        urgency = "high"
        priority_score = max(priority_score, 89)
        trigger_signal = (
            f"spotlight em alta: {opponents_summary['spotlight']['name']}"
            if opponents_summary["spotlight"]["opponent_id"]
            else "spotlight competitivo em alta"
        )
        focus_area = "contra-ataque competitivo"
        suggested_owner = "inteligencia e comunicacao"
        due_window = "nas proximas 24 horas"
        recommendations.insert(
            0,
            "O spotlight temporal indica escalada recente. Converta a leitura em contra-acao politica e narrativa.",
        )
        blockers.insert(0, "A pressao competitiva subiu na janela recente e pede resposta coordenada.")

    if not recommendations:
        recommendations = [
            "Operacao com sinais saudaveis. Mantenha tarefas em dia e atualize a timeline dos adversarios.",
            "Gere relatorios periodicos para transformar o historico do workspace em material de coordenacao.",
            "Revise contatos prioritarios e distribuicao da equipe para sustentar o ritmo atual.",
        ]
    if not blockers:
        blockers = [
            "Nao ha bloqueios criticos no momento, apenas manutencao de cadencia e leitura executiva.",
        ]

    tenant_name = store.tenants[tenant_id].name
    if module == "contacts":
        summary = (
            f"A base possui {len(contacts)} contatos, com {priority_contacts} prioritario(s). "
            f"O foco deve ser classificacao, enriquecimento de notas e distribuicao por territorio."
        )
        if not contacts:
            next_action = "Cadastrar contatos estrategicos"
            action_reason = "Sem base ativa, o modulo de contatos ainda nao sustenta acao territorial nem relacionamento."
            urgency = "high"
            priority_score = max(priority_score, 88)
            trigger_signal = "crm ainda vazio"
            focus_area = "ativacao de CRM"
            suggested_owner = "articulacao territorial"
            due_window = "hoje"
        else:
            focus_area = "qualificacao de base"
            suggested_owner = "articulacao territorial"
            due_window = "nas proximas 48 horas"
        recommendations = [
            item
            for item in recommendations
            if "contato" in item.lower() or "crm" in item.lower() or "classifique" in item.lower()
        ] or recommendations[:3]
        supporting_signals = [
            f"{len(contacts)} contato(s) no CRM.",
            f"{pending_leads} lead(s) aguardando conversao para o CRM.",
            f"{overdue_followups} follow-up(s) atrasado(s) e {due_today_followups} vencendo hoje.",
            f"{priority_contacts} contato(s) classificado(s) como prioritario(s).",
            "Notas, tags e historico territorial sustentam leitura mais precisa.",
        ]
        blockers = [
            item
            for item in blockers
            if "crm" in item.lower() or "base" in item.lower() or "contato" in item.lower()
        ] or blockers[:2]
    elif module == "tasks":
        summary = (
            f"Existem {open_tasks} tarefas em aberto e {overdue_tasks} vencida(s). "
            f"O modulo pede prioridade operacional e fechamento de gargalos."
        )
        if overdue_tasks > 0:
            next_action = "Normalizar fila operacional"
            action_reason = "As tarefas vencidas indicam gargalo objetivo de execucao dentro do modulo."
            urgency = "high"
            priority_score = max(priority_score, 84)
            trigger_signal = f"{overdue_tasks} tarefa(s) vencida(s) no board"
            focus_area = "gargalo de execucao"
            suggested_owner = "operacoes"
            due_window = "hoje"
        else:
            priority_score = max(priority_score, 46)
            trigger_signal = "fila operacional pede cadencia"
            focus_area = "cadencia de entrega"
            suggested_owner = "operacoes"
            due_window = "nesta semana"
        recommendations = [
            item
            for item in recommendations
            if "tarefa" in item.lower() or "fila" in item.lower() or "execucao" in item.lower()
        ] or recommendations[:3]
        supporting_signals = [
            f"{open_tasks} tarefa(s) em aberto no board.",
            f"{overdue_tasks} tarefa(s) vencida(s) no fluxo atual.",
            "A distribuicao por etapa mostra onde a execucao esta represada.",
        ]
        blockers = [
            item
            for item in blockers
            if "backlog" in item.lower() or "entrega" in item.lower() or "tarefa" in item.lower()
        ] or blockers[:2]
    elif module == "opponents":
        summary = (
            f"Ha {len(opponents)} adversario(s), {opponent_events} evento(s) e {critical_events} sinal(is) critico(s). "
            f"A janela recente variou {opponents_summary['momentum_delta']} contra a anterior, com spotlight em "
            f"{opponents_summary['spotlight']['name']}."
        )
        if not opponents:
            next_action = "Cadastrar primeiro adversario"
            action_reason = "Sem monitorados, a leitura competitiva do modulo continua vazia."
            urgency = "normal"
            priority_score = max(priority_score, 52)
            trigger_signal = "monitoramento ainda nao iniciado"
            focus_area = "ativacao de monitoramento"
            suggested_owner = "inteligencia"
            due_window = "nesta semana"
        elif opponents_summary["momentum_direction"] == "up":
            next_action = "Responder aceleracao do spotlight"
            action_reason = (
                f"{opponents_summary['spotlight']['name']} puxou a alta recente e precisa de comparacao e resposta."
            )
            urgency = "high"
            priority_score = max(priority_score, 90)
            trigger_signal = (
                f"delta competitivo {opponents_summary['momentum_delta']}"
                if opponents_summary["spotlight"]["opponent_id"]
                else "delta competitivo em alta"
            )
            focus_area = "resposta competitiva"
            suggested_owner = "inteligencia e comunicacao"
            due_window = "nas proximas 24 horas"
        else:
            priority_score = max(priority_score, 57)
            trigger_signal = "watchlist pede comparacao"
            focus_area = "watchlist comparativa"
            suggested_owner = "inteligencia"
            due_window = "nas proximas 48 horas"
        recommendations = [
            item
            for item in recommendations
            if "advers" in item.lower() or "timeline" in item.lower() or "monitoramento" in item.lower()
        ] or recommendations[:3]
        supporting_signals = [
            f"{len(opponents)} adversario(s) monitorado(s).",
            f"{opponent_events} evento(s) registrados na timeline.",
            (
                f"Spotlight: {opponents_summary['spotlight']['name']} "
                f"com delta {opponents_summary['spotlight']['momentum_delta']}."
            ),
        ]
        blockers = [
            item
            for item in blockers
            if "timeline" in item.lower() or "monitoramento" in item.lower() or "advers" in item.lower()
        ] or blockers[:2]
    elif module == "billing":
        summary = (
            f"A assinatura esta em status {subscription.status}, no plano {subscription.plan}, "
            f"com {trial_days_remaining} dia(s) restantes de trial quando aplicavel. "
            f"O foco aqui e continuidade comercial, conversao e risco de cancelamento."
        )
        if subscription.status == "past_due":
            next_action = "Resolver pendencia financeira"
            action_reason = "O billing ja tem um bloqueio explicito de continuidade e precisa de resolucao imediata."
            urgency = "high"
            priority_score = 95
            trigger_signal = "pendencia comercial ativa"
            focus_area = "continuidade comercial"
            suggested_owner = "financeiro e decisao comercial"
            due_window = "imediatamente"
        elif subscription.cancel_at_period_end:
            next_action = "Reverter cancelamento agendado"
            action_reason = "Ha risco concreto de perda de conta ao fim do periodo atual."
            urgency = "normal"
            priority_score = max(priority_score, 68)
            trigger_signal = "cancelamento agendado"
            focus_area = "retencao"
            suggested_owner = "comercial"
            due_window = "neste ciclo"
        elif subscription.status == "trialing":
            next_action = "Conduzir conversa de conversao"
            action_reason = "O billing ainda esta em trial e precisa transformar uso em receita recorrente."
            urgency = "normal"
            priority_score = max(priority_score, 61)
            trigger_signal = "trial em fase de conversao"
            focus_area = "conversao comercial"
            suggested_owner = "comercial"
            due_window = "antes do fim do trial"
        else:
            next_action = "Reforcar valor percebido do plano"
            action_reason = "Mesmo com conta ativa, billing forte depende de uso percebido e narrativa de continuidade."
            urgency = "normal"
            priority_score = max(priority_score, 44)
            trigger_signal = "conta ativa pronta para expansao"
            focus_area = "retencao e expansao"
            suggested_owner = "comercial"
            due_window = "neste ciclo"
        recommendations = [
            item
            for item in recommendations
            if "trial" in item.lower()
            or "plano" in item.lower()
            or "comercial" in item.lower()
            or "pendencia" in item.lower()
            or "cancelamento" in item.lower()
        ] or recommendations[:3]
        supporting_signals = [
            f"Plano atual: {subscription.plan}.",
            f"Status comercial: {subscription.status}.",
            f"Trial restante: {trial_days_remaining} dia(s) quando aplicavel.",
        ]
        blockers = [
            item
            for item in blockers
            if "comercial" in item.lower()
            or "trial" in item.lower()
            or "cancelamento" in item.lower()
            or "pendencia" in item.lower()
        ] or blockers[:2]
    else:
        summary = (
            f"O workspace possui {len(contacts)} contatos, {priority_contacts} prioritario(s), "
            f"{pending_leads} lead(s) pendente(s) de conversao, {open_tasks} tarefas em aberto, "
            f"{overdue_followups} follow-up(s) atrasado(s), {overdue_tasks} vencida(s), "
            f"{len(opponents)} adversarios e {opponent_events} eventos monitorados. "
            f"O momento atual sugere foco em execucao, conversao comercial e "
            f"classificacao de contexto."
        )

    return {
        "headline": f"Resumo IA de {tenant_name}",
        "module": module,
        "summary": summary,
        "next_action": next_action,
        "action_reason": action_reason,
        "urgency": urgency,
        "priority_score": priority_score,
        "trigger_signal": trigger_signal,
        "focus_area": focus_area,
        "suggested_owner": suggested_owner,
        "due_window": due_window,
        "blockers": blockers[:3],
        "supporting_signals": supporting_signals[:3],
        "recommendations": recommendations[:3],
    }
