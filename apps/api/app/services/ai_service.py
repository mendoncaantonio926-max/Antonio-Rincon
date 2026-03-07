from __future__ import annotations

from datetime import date

from app.services.crud_service import list_contacts, list_opponent_events, list_opponents, list_tasks
from app.services.plan_service import get_subscription_for_tenant, get_trial_days_remaining
from app.services.report_service import list_reports
from app.services.store import store


def get_ai_summary(tenant_id: str, module: str = "dashboard") -> dict:
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    reports = list_reports(tenant_id)
    subscription = get_subscription_for_tenant(tenant_id)
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

    next_action = "Consolidar rotina semanal"
    action_reason = "O workspace esta funcional e pede manutencao de cadencia, leitura executiva e revisao de prioridades."
    urgency = "normal"

    recommendations: list[str] = []
    if overdue_tasks > 0:
        next_action = "Resolver tarefas vencidas"
        action_reason = f"Ha {overdue_tasks} tarefa(s) fora do prazo, o que compromete execucao e previsibilidade operacional."
        urgency = "high"
        recommendations.append(
            f"Existem {overdue_tasks} tarefa(s) vencida(s). Reordene a fila antes de abrir novas frentes."
        )
    if priority_contacts == 0 and contacts:
        if module in {"dashboard", "contacts"} and urgency != "high":
            next_action = "Classificar contatos prioritarios"
            action_reason = "A base ja existe, mas ainda nao orienta a coordenacao porque faltam prioridades explicitas."
            urgency = "normal"
        recommendations.append("Nenhum contato esta marcado como prioritario. Classifique a base para orientar a coordenacao.")
    if not contacts:
        if module in {"dashboard", "contacts"}:
            next_action = "Cadastrar contatos estrategicos"
            action_reason = "Sem base inicial de contatos, o CRM nao consegue puxar territorio, liderancas nem imprensa."
            urgency = "high"
        recommendations.append("Cadastre os primeiros contatos estrategicos para ativar o CRM politico.")
    if not opponents:
        if module in {"dashboard", "opponents"} and urgency != "high":
            next_action = "Abrir monitoramento de adversarios"
            action_reason = "Ainda nao ha adversarios mapeados, entao o workspace opera sem leitura competitiva minima."
            urgency = "normal"
        recommendations.append("Cadastre ao menos um adversario para iniciar o monitoramento.")
    if critical_events > 0:
        if module in {"dashboard", "opponents"}:
            next_action = "Responder sinais criticos da timeline"
            action_reason = f"Foram detectados {critical_events} evento(s) critico(s), o que pede resposta coordenada e material executivo."
            urgency = "high"
        recommendations.append(
            f"Ha {critical_events} evento(s) critico(s) na timeline. Vale converter isso em relatorio executivo."
        )
    if not reports:
        if module in {"dashboard"} and urgency == "normal":
            next_action = "Gerar relatorio executivo"
            action_reason = "O workspace ja acumula atividade, mas ainda nao a consolidou em material de coordenacao."
        recommendations.append("Ainda nao ha relatorios gerados. Crie um resumo executivo para consolidar o ciclo atual.")
    if onboarding_state and not onboarding_state.completed:
        if module == "dashboard":
            next_action = "Fechar onboarding operacional"
            action_reason = "A ativacao inicial ainda nao terminou, o que reduz o contexto disponivel para decisao e rotina."
            urgency = "high"
        recommendations.append("O onboarding ainda nao foi concluido. Termine a ativacao para destravar o uso operacional completo.")
    if subscription.status == "past_due":
        next_action = "Regularizar pendencia comercial"
        action_reason = "A assinatura esta em pendencia financeira e pode travar continuidade de uso e expansao."
        urgency = "high"
        recommendations.append("A conta esta em pendencia financeira. Resolva isso antes de ampliar o uso do workspace.")
    elif subscription.cancel_at_period_end and module == "dashboard" and urgency != "high":
        next_action = "Reavaliar risco de cancelamento"
        action_reason = "Existe cancelamento agendado, entao convem confirmar renovacao, entrega percebida e plano correto."
        urgency = "normal"
        recommendations.append("Ha cancelamento agendado para o fim do periodo. Reforce entrega e revise o plano adequado.")
    elif subscription.status == "trialing" and trial_days_remaining <= 5 and module == "dashboard" and urgency != "high":
        next_action = "Converter trial em plano ativo"
        action_reason = f"O trial termina em {trial_days_remaining} dia(s), entao a conversa comercial precisa acontecer agora."
        urgency = "normal"
        recommendations.append("O trial esta perto do fim. Prepare conversao ou ajuste de plano antes do vencimento.")
    if not recommendations:
        recommendations = [
            "Operacao com sinais saudaveis. Mantenha tarefas em dia e atualize a timeline dos adversarios.",
            "Gere relatorios periodicos para transformar o historico do workspace em material de coordenacao.",
            "Revise contatos prioritarios e distribuicao da equipe para sustentar o ritmo atual.",
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
        recommendations = [
            item
            for item in recommendations
            if "contato" in item.lower() or "crm" in item.lower() or "classifique" in item.lower()
        ] or recommendations[:3]
    elif module == "tasks":
        summary = (
            f"Existem {open_tasks} tarefas em aberto e {overdue_tasks} vencida(s). "
            f"O modulo pede prioridade operacional e fechamento de gargalos."
        )
        if overdue_tasks > 0:
            next_action = "Normalizar fila operacional"
            action_reason = "As tarefas vencidas indicam gargalo objetivo de execucao dentro do modulo."
            urgency = "high"
        recommendations = [
            item
            for item in recommendations
            if "tarefa" in item.lower() or "fila" in item.lower() or "execucao" in item.lower()
        ] or recommendations[:3]
    elif module == "opponents":
        summary = (
            f"Ha {len(opponents)} adversario(s), {opponent_events} evento(s) e {critical_events} sinal(is) critico(s). "
            f"O foco deve ser comparacao, timeline e resposta coordenada."
        )
        if not opponents:
            next_action = "Cadastrar primeiro adversario"
            action_reason = "Sem monitorados, a leitura competitiva do modulo continua vazia."
            urgency = "normal"
        elif critical_events > 0:
            next_action = "Produzir resposta para sinais criticos"
            action_reason = "A timeline ja mostra criticidade suficiente para virar acao coordenada."
            urgency = "high"
        recommendations = [
            item
            for item in recommendations
            if "advers" in item.lower() or "timeline" in item.lower() or "monitoramento" in item.lower()
        ] or recommendations[:3]
    else:
        summary = (
            f"O workspace possui {len(contacts)} contatos, {priority_contacts} prioritario(s), "
            f"{open_tasks} tarefas em aberto, {overdue_tasks} vencida(s), {len(opponents)} adversarios "
            f"e {opponent_events} eventos monitorados. O momento atual sugere foco em execucao, "
            f"classificacao de contexto e consolidacao executiva."
        )

    return {
        "headline": f"Resumo IA de {tenant_name}",
        "module": module,
        "summary": summary,
        "next_action": next_action,
        "action_reason": action_reason,
        "urgency": urgency,
        "recommendations": recommendations[:3],
    }
