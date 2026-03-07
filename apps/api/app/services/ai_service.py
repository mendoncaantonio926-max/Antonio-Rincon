from __future__ import annotations

from datetime import date

from app.services.crud_service import list_contacts, list_opponent_events, list_opponents, list_tasks
from app.services.report_service import list_reports
from app.services.store import store


def get_ai_summary(tenant_id: str, module: str = "dashboard") -> dict:
    contacts = list_contacts(tenant_id)
    tasks = list_tasks(tenant_id)
    opponents = list_opponents(tenant_id)
    reports = list_reports(tenant_id)
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

    recommendations: list[str] = []
    if overdue_tasks > 0:
        recommendations.append(
            f"Existem {overdue_tasks} tarefa(s) vencida(s). Reordene a fila antes de abrir novas frentes."
        )
    if priority_contacts == 0 and contacts:
        recommendations.append("Nenhum contato esta marcado como prioritario. Classifique a base para orientar a coordenacao.")
    if not contacts:
        recommendations.append("Cadastre os primeiros contatos estrategicos para ativar o CRM politico.")
    if not opponents:
        recommendations.append("Cadastre ao menos um adversario para iniciar o monitoramento.")
    if critical_events > 0:
        recommendations.append(
            f"Ha {critical_events} evento(s) critico(s) na timeline. Vale converter isso em relatorio executivo."
        )
    if not reports:
        recommendations.append("Ainda nao ha relatorios gerados. Crie um resumo executivo para consolidar o ciclo atual.")
    if onboarding_state and not onboarding_state.completed:
        recommendations.append("O onboarding ainda nao foi concluido. Termine a ativacao para destravar o uso operacional completo.")
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
        "recommendations": recommendations[:3],
    }
