import { Badge, Button, Card, Input } from "@pulso/ui";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthPage } from "./AuthPage";
import {
  type AiSummary,
  api,
  type BillingEvent,
  type BillingPlan,
  type Campaign,
  type Contact,
  type DashboardSummary,
  type Lead,
  type Membership,
  type OnboardingState,
  type Opponent,
  type OpponentEvent,
  type OpponentSummary,
  type Report,
  type Subscription,
  type Task,
} from "./api";
import { AuthProvider, useAuth } from "./auth";
import { ProtectedRoute } from "./ProtectedRoute";

function LandingPage() {
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [leadPending, setLeadPending] = useState(false);
  const plans = [
    {
      name: "Essential",
      price: "R$ 197/mes",
      description: "Base para operacao inicial, agenda de contatos e rotina enxuta.",
    },
    {
      name: "Pro",
      price: "R$ 397/mes",
      description: "Ideal para coordenacao com equipe pequena e entregas recorrentes.",
    },
    {
      name: "Executive",
      price: "R$ 697/mes",
      description: "Mais governanca, multiusuario e ritmo forte de acompanhamento.",
    },
  ];
  const faqs = [
    {
      question: "O Pulso Politico e para campanha ou para mandato?",
      answer:
        "Os dois. O foco inicial e campanha, mas a arquitetura ja prepara continuidade operacional para transicao ao mandato.",
    },
    {
      question: "Preciso integrar com outras ferramentas para comecar?",
      answer:
        "Nao. O MVP ja entrega CRM, onboarding, tarefas, auditoria e relatorios sem depender de integracoes externas no primeiro uso.",
    },
    {
      question: "Como funciona a demonstracao comercial?",
      answer:
        "Voce pode enviar seus dados no formulario, agendar uma demo guiada ou falar diretamente no WhatsApp para apresentar o caso da operacao.",
    },
  ];

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setLeadPending(true);
    try {
      await api.createLead({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? "") || null,
        role: String(formData.get("role") ?? "") || null,
        city: String(formData.get("city") ?? "") || null,
        challenge: String(formData.get("challenge") ?? "") || null,
      });
      form.reset();
      setLeadMessage("Lead enviado com sucesso.");
    } catch (error) {
      setLeadMessage(error instanceof Error ? error.message : "Falha ao enviar lead.");
    } finally {
      setLeadPending(false);
    }
  }

  return (
    <main className="landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="warning">Sistema operacional para campanha e mandato</Badge>
          <h1>Transforme pressao politica em comando, leitura e execucao com presenca de marca.</h1>
          <p className="hero-text">
            Plataforma para campanhas eleitorais e transicao para mandato, com CRM, monitoramento,
            workflow, relatorios e inteligencia operacional apresentados com a sobriedade de uma
            sala de estrategia, nao com cara de template reciclado.
          </p>
          <div className="hero-actions">
            <Link to="/register">
              <Button label="Abrir workspace" />
            </Link>
            <Link to="/contact">
              <Button label="Agendar demo executiva" variant="secondary" />
            </Link>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              <Button label="Canal comercial" variant="secondary" />
            </a>
          </div>
          <div className="hero-trust">
            <Badge tone="success">CRM, relatorios e monitoramento vivos</Badge>
            <Badge tone="neutral">Dashboard com IA contextual</Badge>
            <Badge tone="info">Release publica v0.1.5</Badge>
          </div>
          <div className="hero-metrics">
            <article>
              <strong>3 frentes</strong>
              <span>campanha, coordenacao e continuidade</span>
            </article>
            <article>
              <strong>1 base</strong>
              <span>contatos, tarefas, adversarios e billing no mesmo fluxo</span>
            </article>
            <article>
              <strong>0 improviso</strong>
              <span>mais governanca, historico e leitura executiva</span>
            </article>
          </div>
        </div>
        <Card className="hero-panel" eyebrow="Sala de comando" title="Leitura premium do workspace">
          <div className="hero-panel-stack">
            <article className="hero-panel-highlight">
              <strong>Operacao</strong>
              <p>CRM politico, tarefas, onboarding, auditoria e billing com narrativa unica.</p>
            </article>
            <article className="hero-panel-highlight">
              <strong>Monitoramento</strong>
              <p>Adversarios, timeline, watchlist comparativa e sinais criticos em destaque.</p>
            </article>
            <article className="hero-panel-highlight">
              <strong>Decisao</strong>
              <p>IA contextual, relatorios exportaveis e proxima acao recomendada por modulo.</p>
            </article>
          </div>
        </Card>
      </section>

      <section className="landing-block">
        <div className="section-heading">
          <Badge tone="neutral">Dores que travam campanha</Badge>
          <h2>Quando a operacao cresce, o improviso cobra caro.</h2>
        </div>
        <div className="feature-grid">
          <Card title="Equipe desalinhada">
            <p>Tarefas dispersas, prioridades confusas e dependencia de memoria operacional.</p>
          </Card>
          <Card title="Dados sem rastreabilidade">
            <p>Contatos, adversarios e decisões ficam espalhados em planilhas, chats e cadernos.</p>
          </Card>
          <Card title="Baixa governanca">
            <p>Falta controle de acesso, historico de acoes e visao executiva para coordenacao.</p>
          </Card>
        </div>
      </section>

      <section className="landing-block landing-block--alt">
        <div className="section-heading">
          <Badge tone="info">Solucao</Badge>
          <h2>Uma base unica para organizar campanha, equipe e inteligencia operacional.</h2>
        </div>
        <div className="feature-grid">
          <Card title="Workspace por operacao">
            <p>
              Tenant proprio, memberships e roles para separar dados, acessos e responsabilidade.
            </p>
          </Card>
          <Card title="Execucao visivel">
            <p>Kanban, tarefas recentes, alertas e dashboard para leitura rapida do dia.</p>
          </Card>
          <Card title="Memoria institucional">
            <p>
              Relatorios, auditoria e acompanhamento de adversarios para sustentar decisao e
              continuidade.
            </p>
          </Card>
        </div>
      </section>

      <section className="feature-grid">
        <Card title="Controle">
          <p>Centralize equipe, dados e operacao em um unico workspace.</p>
        </Card>
        <Card title="Governanca">
          <p>Roles, auditoria e rastreabilidade para operacoes sensiveis.</p>
        </Card>
        <Card title="Continuidade">
          <p>Migre a inteligencia da campanha para o mandato sem perder contexto.</p>
        </Card>
      </section>

      <section className="landing-block">
        <div className="section-heading">
          <Badge tone="neutral">Funcionalidades</Badge>
          <h2>Modulos pensados para uso real da operacao.</h2>
        </div>
        <div className="feature-grid">
          <Card title="Captacao e CRM">
            <p>Registro de leads, contatos, categorias, tags e historico simples.</p>
          </Card>
          <Card title="Onboarding guiado">
            <p>Campanha inicial, ativacao do workspace e primeiros registros estrategicos.</p>
          </Card>
          <Card title="Adversarios e relatorios">
            <p>Timeline de eventos, exportacao e leitura executiva para coordenacao.</p>
          </Card>
        </div>
      </section>

      <section className="landing-block landing-block--alt">
        <div className="section-heading">
          <Badge tone="warning">Planos</Badge>
          <h2>Estrutura comercial inicial para venda e validacao.</h2>
        </div>
        <div className="feature-grid">
          {plans.map((plan) => (
            <Card key={plan.name} title={plan.name}>
              <p className="plan-price">{plan.price}</p>
              <p>{plan.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="landing-block">
        <div className="section-heading">
          <Badge tone="info">FAQ</Badge>
          <h2>Perguntas frequentes antes de testar.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((item) => (
            <Card key={item.question} title={item.question}>
              <p>{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="lead-section">
        <form className="panel form-panel" onSubmit={handleLeadSubmit}>
          <h2>Solicitar demonstracao</h2>
          <Input label="Nome" name="name" required minLength={2} />
          <Input label="Email" name="email" type="email" required />
          <Input label="WhatsApp" name="phone" />
          <Input label="Cargo" name="role" placeholder="candidato, assessor, consultor" />
          <Input label="Cidade" name="city" />
          <Input label="Principal desafio" name="challenge" multiline rows={4} />
          {leadMessage ? <div className="info-box">{leadMessage}</div> : null}
          <div className="cta-actions">
            <Button
              type="submit"
              label={leadPending ? "Enviando..." : "Enviar lead"}
              disabled={leadPending}
            />
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              <Button type="button" label="Chamar no WhatsApp" variant="secondary" />
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

function PlansPage() {
  const plans = [
    {
      name: "Essential",
      price: "R$ 197/mes",
      description: "Para operacao inicial e campanhas enxutas.",
    },
    {
      name: "Pro",
      price: "R$ 397/mes",
      description: "Para coordenacao de campanha com equipe pequena.",
    },
    {
      name: "Executive",
      price: "R$ 697/mes",
      description: "Para operacoes mais estruturadas e multiusuario.",
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      description: "Para partidos, consultorias e estruturas ampliadas.",
    },
  ];

  return (
    <main className="landing-shell">
      <section className="panel">
        <p className="eyebrow">Planos</p>
        <h1>Estrutura comercial do Pulso Politico</h1>
        <div className="feature-grid">
          {plans.map((plan) => (
            <article key={plan.name}>
              <h3>{plan.name}</h3>
              <p className="plan-price">{plan.price}</p>
              <p>{plan.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="landing-shell">
      <section className="panel">
        <p className="eyebrow">Contato</p>
        <h1>Fale com a equipe do Pulso Politico</h1>
        <div className="list-grid">
          <article className="list-card">
            <strong>Email comercial</strong>
            <span>comercial@pulso-politico.local</span>
          </article>
          <article className="list-card">
            <strong>WhatsApp</strong>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              +55 11 99999-9999
            </a>
          </article>
          <article className="list-card">
            <strong>Horario de atendimento</strong>
            <span>Segunda a sexta, 9h as 18h</span>
          </article>
        </div>
      </section>
    </main>
  );
}

function PrivacyPage() {
  return (
    <main className="landing-shell">
      <section className="panel prose-panel">
        <p className="eyebrow">Privacidade</p>
        <h1>Politica de Privacidade</h1>
        <p>
          O Pulso Politico coleta apenas os dados necessarios para demonstracao, operacao de conta,
          autenticacao e uso do produto. Dados sensiveis devem ser tratados com base legal adequada,
          minimizacao e controle de acesso por tenant.
        </p>
        <p>
          Este scaffold inclui base de arquitetura para segregacao logica, auditoria e controle de
          roles, mas a revisao juridica final e a politica definitiva devem ser validadas antes de
          uso em producao.
        </p>
      </section>
    </main>
  );
}

function TermsPage() {
  return (
    <main className="landing-shell">
      <section className="panel prose-panel">
        <p className="eyebrow">Termos</p>
        <h1>Termos de Uso</h1>
        <p>
          O uso do produto depende de credenciais validas, respeito aos limites do plano e
          observancia das regras operacionais e legais aplicaveis ao contexto politico e ao
          tratamento de dados.
        </p>
        <p>
          Este repositorio representa um scaffold funcional de MVP. Regras comerciais, SLA,
          obrigacoes juridicas e contratos definitivos devem ser formalizados antes da operacao
          comercial real.
        </p>
      </section>
    </main>
  );
}

function DashboardPage() {
  const { tokens, user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiModule, setAiModule] = useState("dashboard");
  const [dashboardLeadPending, setDashboardLeadPending] = useState<string | null>(null);
  const [dashboardLeadMessage, setDashboardLeadMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!tokens?.access_token) {
      return;
    }

    const [dashboardPayload, aiPayload] = await Promise.all([
      api.dashboardSummary(tokens.access_token),
      api.getAiSummary(tokens.access_token, aiModule),
    ]);
    setSummary(dashboardPayload);
    setAiSummary(aiPayload);
  }, [aiModule, tokens]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleDashboardLeadAction(mode: "assign_owner" | "schedule_today") {
    if (!tokens?.access_token || !summary?.priority_lead_id) {
      return;
    }

    const updates =
      mode === "assign_owner"
        ? { owner_user_id: summary.priority_lead_suggested_owner_user_id || "" }
        : { follow_up_at: new Date().toISOString().slice(0, 10) };
    setDashboardLeadPending(mode);
    setDashboardLeadMessage(null);
    try {
      await api.updateLead(tokens.access_token, summary.priority_lead_id, updates);
      setDashboardLeadMessage(
        mode === "assign_owner"
          ? "Owner sugerido aplicado na fila comercial."
          : "Follow-up priorizado para hoje no dashboard.",
      );
      await loadDashboard();
    } catch (error) {
      setDashboardLeadMessage(
        error instanceof Error ? error.message : "Falha ao executar acao rapida do dashboard.",
      );
    } finally {
      setDashboardLeadPending(null);
    }
  }

  return (
    <section className="app-section">
      <header className="topbar">
        <div>
          <p className="eyebrow">{summary?.tenant_name ?? "Workspace"}</p>
          <h1>Visao geral</h1>
          <p className="meta-copy">{user?.full_name ?? "Usuario"}</p>
        </div>
      </header>
      <div className="dashboard-hero panel">
        <div className="dashboard-hero__copy">
          <div className="section-heading">
            <p className="eyebrow">Proximo movimento</p>
            <h2>Prioridade da coordenacao</h2>
            <p className="meta-copy">
              {summary?.next_action ?? "Carregando recomendacao operacional..."}
            </p>
          </div>
          {dashboardLeadMessage ? <div className="info-box">{dashboardLeadMessage}</div> : null}
        </div>
        <div className="dashboard-hero__rail">
          <Badge tone={summary?.overdue_tasks_count ? "warning" : "info"}>
            {summary?.trial_status ?? "trialing"}
          </Badge>
          <article className="signal-chip">
            <span>Plano atual</span>
            <strong>{summary?.plan ?? "carregando"}</strong>
          </article>
          <article className="signal-chip">
            <span>Equipe ativa</span>
            <strong>{summary?.memberships_count ?? 0}</strong>
          </article>
          <article className="signal-chip">
            <span>Relatorios</span>
            <strong>{summary?.reports_count ?? 0}</strong>
          </article>
          <article className="signal-chip">
            <span>Fila critica</span>
            <strong>{summary?.critical_queue_count ?? 0}</strong>
          </article>
        </div>
      </div>
      <div className="dashboard-metrics">
        <article className="metric-tile">
          <span>Contatos</span>
          <strong>{summary?.contacts_count ?? 0}</strong>
          <p>Base ativa no workspace.</p>
        </article>
        <article className="metric-tile">
          <span>Prioritarios</span>
          <strong>{summary?.priority_contacts_count ?? 0}</strong>
          <p>Leitura de calor para coordenacao.</p>
        </article>
        <article className="metric-tile">
          <span>Leads pendentes</span>
          <strong>{summary?.pending_leads_count ?? 0}</strong>
          <p>
            {summary?.pending_leads_count
              ? "Existe demanda quente aguardando conversao."
              : "Fila comercial tratada no CRM."}
          </p>
        </article>
        <article className="metric-tile">
          <span>Follow-ups atrasados</span>
          <strong>{summary?.overdue_followups_count ?? 0}</strong>
          <p>
            {summary?.overdue_followups_count
              ? "O SLA comercial ja foi rompido em parte da fila."
              : "Sem atraso comercial no momento."}
          </p>
        </article>
        <article className="metric-tile">
          <span>Tarefas em aberto</span>
          <strong>{summary?.open_tasks_count ?? 0}</strong>
          <p>Frente operacional em execucao.</p>
        </article>
        <article className="metric-tile">
          <span>Tarefas vencidas</span>
          <strong>{summary?.overdue_tasks_count ?? 0}</strong>
          <p>
            {summary?.overdue_tasks_count
              ? "Ha pontos atrasados exigindo resposta."
              : "Sem atraso critico agora."}
          </p>
        </article>
        <article className="metric-tile">
          <span>Adversarios ativos</span>
          <strong>{summary?.opponents_count ?? 0}</strong>
          <p>Monitoramento politico vivo.</p>
        </article>
        <article className="metric-tile">
          <span>Equipe ativa</span>
          <strong>{summary?.memberships_count ?? 0}</strong>
          <p>Capacidade atual de execucao.</p>
        </article>
      </div>
      <div className="dashboard-focus-grid">
        <section className="panel dashboard-ai-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Leitura contextual</p>
              <h2>{aiSummary?.headline ?? "Resumo IA"}</h2>
            </div>
            <select value={aiModule} onChange={(event) => setAiModule(event.target.value)}>
              <option value="dashboard">Workspace</option>
              <option value="contacts">Contatos</option>
              <option value="tasks">Tarefas</option>
              <option value="opponents">Adversarios</option>
              <option value="billing">Assinatura</option>
            </select>
          </div>
          <p className="dashboard-ai-summary">
            {aiSummary?.summary ?? "Carregando recomendacoes..."}
          </p>
          <div className="dashboard-ai-callout">
            <strong>{aiSummary?.next_action ?? "Definindo proxima acao..."}</strong>
            <p>{aiSummary?.action_reason ?? "Lendo o contexto operacional do workspace."}</p>
            <span>Urgencia {aiSummary?.urgency ?? "normal"}</span>
          </div>
          <div className="dashboard-ai-meta">
            <article className="dashboard-ai-meta-card">
              <span>Escore de prioridade</span>
              <strong>{aiSummary?.priority_score ?? 0}/100</strong>
            </article>
            <article className="dashboard-ai-meta-card">
              <span>Gatilho principal</span>
              <strong>{aiSummary?.trigger_signal ?? "Leitura em formacao"}</strong>
            </article>
            <article className="dashboard-ai-meta-card">
              <span>Foco sugerido</span>
              <strong>{aiSummary?.focus_area ?? "Lendo contexto"}</strong>
            </article>
            <article className="dashboard-ai-meta-card">
              <span>Dono sugerido</span>
              <strong>{aiSummary?.suggested_owner ?? "Coordenacao"}</strong>
            </article>
            <article className="dashboard-ai-meta-card">
              <span>Janela de resposta</span>
              <strong>{aiSummary?.due_window ?? "Nesta semana"}</strong>
            </article>
          </div>
          {aiSummary?.recommendations?.length ? (
            <div className="dashboard-recommendations dashboard-recommendations--grid">
              {aiSummary.recommendations.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
          <div className="dashboard-ai-lists">
            <article className="dashboard-ai-list">
              <span>Sinais que sustentam a leitura</span>
              <div className="dashboard-recommendations">
                {aiSummary?.supporting_signals?.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
            <article className="dashboard-ai-list">
              <span>Bloqueadores atuais</span>
              <div className="dashboard-recommendations">
                {aiSummary?.blockers?.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </div>
        </section>
        <section className="panel dashboard-snapshot">
          <div className="section-heading">
            <p className="eyebrow">Panorama executivo</p>
            <h2>Onde a energia deve entrar</h2>
          </div>
          <article className="dashboard-commercial-focus">
            <div className="dashboard-commercial-focus__header">
              <div>
                <p className="eyebrow">Fila comercial priorizada</p>
                <h3>{summary?.priority_lead_name ?? "Sem lead critico no momento"}</h3>
              </div>
              <Badge tone={summary?.critical_queue_count ? "warning" : "info"}>
                {`Risco ${summary?.priority_lead_risk_score ?? 0}`}
              </Badge>
            </div>
            <p className="meta-copy">
              {summary?.priority_lead_owner_name
                ? `Puxar com ${summary.priority_lead_owner_name} na janela ${summary.priority_lead_follow_up_label ?? "definida"}.`
                : "Sem prioridade comercial aberta neste momento."}
            </p>
            <div className="dashboard-commercial-focus__actions">
              {!summary?.priority_lead_has_owner &&
              summary?.priority_lead_suggested_owner_user_id ? (
                <Button
                  label={
                    dashboardLeadPending === "assign_owner"
                      ? "Atribuindo owner..."
                      : "Atribuir owner sugerido"
                  }
                  variant="secondary"
                  onClick={() => void handleDashboardLeadAction("assign_owner")}
                  disabled={dashboardLeadPending !== null}
                />
              ) : null}
              {summary?.priority_lead_id ? (
                <Button
                  label={
                    dashboardLeadPending === "schedule_today"
                      ? "Priorizando hoje..."
                      : "Puxar follow-up para hoje"
                  }
                  variant="secondary"
                  onClick={() => void handleDashboardLeadAction("schedule_today")}
                  disabled={dashboardLeadPending !== null}
                />
              ) : null}
              <Button
                label="Abrir fila comercial"
                variant="secondary"
                onClick={() => navigate("/app/leads")}
              />
            </div>
            <div className="dashboard-commercial-groups">
              <article className="dashboard-commercial-list">
                <span>Owners puxando a fila</span>
                <div className="dashboard-recommendations">
                  {(summary?.commercial_owner_groups ?? []).map((group) => (
                    <span key={`owner-${group.label}`}>
                      {group.label}: {group.leads_count} lead(s), {group.overdue_count} atrasado(s)
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Janelas de follow-up</span>
                <div className="dashboard-recommendations">
                  {(summary?.commercial_window_groups ?? []).map((group) => (
                    <span key={`window-${group.label}`}>
                      {group.label}: {group.leads_count} lead(s)
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Alertas por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_alerts ?? []).map((alert) => (
                    <span key={`alert-${alert.owner_label}`}>
                      {alert.owner_label}: {alert.summary}
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Fila de hoje</span>
                <div className="dashboard-recommendations">
                  {(summary?.daily_execution_queue ?? []).map((item) => (
                    <span key={`queue-${item.lead_id}`}>
                      {item.lead_name}: {item.owner_label}, {item.follow_up_label}, risco{" "}
                      {item.risk_score}
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Primeira agenda do dia</span>
                <div className="dashboard-recommendations">
                  <span>{summary?.morning_focus_summary ?? "Carregando agenda comercial..."}</span>
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Resumo diario por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_daily_briefs ?? []).map((item) => (
                    <span key={`brief-${item.owner_label}`}>
                      {item.owner_label}: {item.first_action}. {item.brief}
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Produtividade por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_productivity ?? []).map((item) => (
                    <span key={`owner-productivity-${item.label}`}>
                      {item.label}: {item.converted_count} convertido(s), {item.pending_count} na
                      fila
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Produtividade por janela</span>
                <div className="dashboard-recommendations">
                  {(summary?.window_productivity ?? []).map((item) => (
                    <span key={`window-productivity-${item.label}`}>
                      {item.label}: {item.converted_count} convertido(s), {item.pending_count}{" "}
                      ativo(s)
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Meta por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_targets ?? []).map((item) => (
                    <span key={`owner-target-${item.owner_label}`}>
                      {item.owner_label}: meta {item.target_conversions}, realizado{" "}
                      {item.actual_conversions}, gap {item.gap} ({item.status})
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Throughput comercial</span>
                <div className="dashboard-recommendations">
                  <span>
                    {summary?.throughput_comparison.summary ??
                      "A comparacao de throughput aparece quando as conversoes entram em ritmo."}
                  </span>
                  <span>
                    {summary?.throughput_comparison.current_window_label ?? "Janela atual"}:{" "}
                    {summary?.throughput_comparison.current_window_count ?? 0}
                  </span>
                  <span>
                    {summary?.throughput_comparison.previous_window_label ?? "Janela anterior"}:{" "}
                    {summary?.throughput_comparison.previous_window_count ?? 0}
                  </span>
                  <span>
                    Delta {summary?.throughput_comparison.delta ?? 0} (
                    {summary?.throughput_comparison.direction ?? "stable"})
                  </span>
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Variacao por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_throughput ?? []).map((item) => (
                    <span key={`owner-throughput-${item.owner_label}`}>
                      {item.owner_label}: {item.current_window_count} agora,{" "}
                      {item.previous_window_count} antes, delta {item.delta} ({item.direction})
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Saude por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_health ?? []).map((item) => (
                    <span key={`owner-health-${item.owner_label}`}>
                      {item.owner_label}: score {item.health_score}, {item.pressure_label}, gap{" "}
                      {item.target_gap}, atraso {item.overdue_count}, delta {item.throughput_delta}
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Fila de recuperacao</span>
                <div className="dashboard-recommendations">
                  {(summary?.recovery_queue ?? []).map((item) => (
                    <span key={`recovery-${item.lead_id}`}>
                      {item.lead_name}: {item.reason}. {item.recommended_action} com{" "}
                      {item.owner_label}.
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Pressao por janela</span>
                <div className="dashboard-recommendations">
                  {(summary?.window_pressure ?? []).map((item) => (
                    <span key={`window-pressure-${item.window_label}`}>
                      {item.window_label}: {item.leads_count} lead(s), {item.high_risk_count} em
                      risco, {item.owners_involved} owner(s), {item.pressure_label}
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Redistribuicao sugerida</span>
                <div className="dashboard-recommendations">
                  {(summary?.rebalance_suggestions ?? []).map((item) => (
                    <span key={`rebalance-${item.lead_name}-${item.to_owner_label}`}>
                      {item.lead_name}: mover de {item.from_owner_label} para {item.to_owner_label}.{" "}
                      {item.reason}
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Capacidade por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_capacity ?? []).map((item) => (
                    <span key={`owner-capacity-${item.owner_label}`}>
                      {item.owner_label}: fila {item.active_queue_count}, capacidade{" "}
                      {item.available_capacity}, carga {item.load_label}, janela{" "}
                      {item.recommended_window}
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Alocacao sugerida</span>
                <div className="dashboard-recommendations">
                  {(summary?.assignment_suggestions ?? []).map((item) => (
                    <span key={`assignment-${item.lead_name}-${item.to_owner_label}`}>
                      {item.lead_name}: de {item.from_owner_label} para {item.to_owner_label} em{" "}
                      {item.recommended_window}. {item.reason}
                    </span>
                  ))}
                </div>
              </article>
            </div>
            <div className="dashboard-commercial-grid">
              <article className="dashboard-commercial-list">
                <span>Plano diario por owner</span>
                <div className="dashboard-recommendations">
                  {(summary?.owner_daily_plan ?? []).map((item) => (
                    <span key={`owner-plan-${item.owner_label}`}>
                      {item.owner_label}: {item.focus_today}. Fila {item.queue_size}, proxima janela{" "}
                      {item.next_window}. {item.priority_reason}
                    </span>
                  ))}
                </div>
              </article>
              <article className="dashboard-commercial-list">
                <span>Plano por janela</span>
                <div className="dashboard-recommendations">
                  {(summary?.window_allocation_plan ?? []).map((item) => (
                    <span key={`window-plan-${item.window_label}`}>
                      {item.window_label}: {item.focus_count} lead(s), owner principal{" "}
                      {item.primary_owner_label}. {item.plan_summary}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </article>
          <div className="snapshot-list">
            <article>
              <span>Base politica</span>
              <strong>{summary?.contacts_count ?? 0} contato(s) sustentam a operacao atual.</strong>
            </article>
            <article>
              <span>Conversao comercial</span>
              <strong>
                {summary?.pending_leads_count ?? 0} lead(s) seguem aguardando qualificacao final.
              </strong>
            </article>
            <article>
              <span>Ritmo comercial</span>
              <strong>
                {summary?.hot_leads_count ?? 0} lead(s) quente(s), com{" "}
                {summary?.due_today_followups_count ?? 0} follow-up(s) vencendo hoje.
              </strong>
            </article>
            <article>
              <span>Execucao comercial</span>
              <strong>
                {summary?.critical_queue_count ?? 0} lead(s) com risco alto ou critico pedem dono e
                resposta imediata.
              </strong>
            </article>
            <article>
              <span>Coordenacao</span>
              <strong>
                {summary?.open_tasks_count ?? 0} frente(s) abertas pedem acompanhamento de rotina.
              </strong>
            </article>
            <article>
              <span>Monitoramento</span>
              <strong>
                {summary?.opponents_count ?? 0} adversario(s) seguem no radar do workspace.
              </strong>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}

function TeamPage() {
  const { tokens } = useAuth();
  const [members, setMembers] = useState<Membership[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("Workspace");
  const roleLabels: Record<Membership["role"], string> = {
    owner: "Owner",
    admin: "Admin",
    coordinator: "Coordenacao",
    analyst: "Analise",
    viewer: "Leitura",
  };
  const operationalMembers = members.filter((member) => member.role !== "viewer").length;
  const leadershipMembers = members.filter(
    (member) => member.role === "owner" || member.role === "admin" || member.role === "coordinator",
  ).length;
  const analysts = members.filter((member) => member.role === "analyst").length;

  const loadMembers = useCallback(async () => {
    if (!tokens?.access_token) return;
    const [membershipList, tenant] = await Promise.all([
      api.listMemberships(tokens.access_token),
      api.currentTenant(tokens.access_token),
    ]);
    setMembers(membershipList);
    setTenantName(tenant.tenant.name);
  }, [tokens]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.inviteMember(tokens.access_token, {
        email: String(formData.get("email") ?? ""),
        full_name: String(formData.get("full_name") ?? ""),
        role: String(formData.get("role") ?? "analyst"),
      });
      form.reset();
      await loadMembers();
      setMessage("Membro adicionado ao workspace.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao convidar membro.");
    }
  }

  async function handleTenantUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const formData = new FormData(event.currentTarget);
    try {
      const response = await api.updateCurrentTenant(tokens.access_token, {
        name: String(formData.get("tenant_name") ?? ""),
      });
      setTenantName(response.name);
      setMessage("Workspace atualizado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar workspace.");
    }
  }

  async function handleRoleChange(membershipId: string, role: Membership["role"]) {
    if (!tokens?.access_token) return;
    try {
      await api.updateMembershipRole(tokens.access_token, membershipId, { role });
      await loadMembers();
      setMessage("Role atualizada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar role.");
    }
  }

  async function handleRemoveMember(membershipId: string) {
    if (!tokens?.access_token) return;
    try {
      await api.deleteMembership(tokens.access_token, membershipId);
      await loadMembers();
      setMessage("Membro removido do workspace.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao remover membro.");
    }
  }

  return (
    <section className="app-section split-layout wide-layout team-layout">
      <form className="panel form-panel entity-form" onSubmit={handleTenantUpdate}>
        <div className="section-heading">
          <p className="eyebrow">Governanca</p>
          <h2>Identidade do workspace</h2>
          <p className="meta-copy">
            Ajuste o nome institucional e mantenha a frente operacional com leitura clara para
            equipe, coordenacao e parceiros.
          </p>
        </div>
        <label>
          Nome do workspace
          <input name="tenant_name" defaultValue={tenantName} required minLength={3} />
        </label>
        <div className="list-grid summary-grid">
          <article className="summary-tile">
            <strong>Workspace ativo</strong>
            <span>{tenantName}</span>
          </article>
          <article className="summary-tile">
            <strong>Lideranca</strong>
            <span>{leadershipMembers}</span>
          </article>
        </div>
        <Button type="submit" label="Atualizar identidade" />
      </form>

      <form className="panel form-panel entity-form" onSubmit={handleInvite}>
        <div className="section-heading">
          <p className="eyebrow">Expansao do time</p>
          <h2>Convidar membro</h2>
          <p className="meta-copy">
            Traga novas pessoas com o papel certo para manter rastreabilidade e ritmo operacional
            desde o primeiro dia.
          </p>
        </div>
        <label>
          Nome completo
          <input name="full_name" required minLength={3} />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Role
          <select name="role" defaultValue="analyst">
            <option value="admin">Admin</option>
            <option value="coordinator">Coordenacao</option>
            <option value="analyst">Analise</option>
            <option value="viewer">Leitura</option>
          </select>
        </label>
        <div className="list-grid summary-grid">
          <article className="summary-tile">
            <strong>Operacao ativa</strong>
            <span>{operationalMembers}</span>
          </article>
          <article className="summary-tile">
            <strong>Analistas</strong>
            <span>{analysts}</span>
          </article>
        </div>
        <Button type="submit" label="Enviar convite" />
      </form>

      <div className="panel team-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Leitura de equipe</p>
            <h2>Equipe</h2>
          </div>
          <span>{members.length}</span>
        </div>
        {message ? <div className="info-box">{message}</div> : null}
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Membros totais</strong>
            <span>{members.length}</span>
          </article>
          <article className="summary-tile">
            <strong>Lideranca ativa</strong>
            <span>{leadershipMembers}</span>
          </article>
          <article className="summary-tile">
            <strong>Operacao</strong>
            <span>{operationalMembers}</span>
          </article>
        </div>
        <div className="list-grid member-records">
          {members.map((member) => (
            <article className="list-card member-card" key={member.id}>
              <div className="section-header">
                <div className="member-card__header">
                  <strong>{member.full_name}</strong>
                  <span>{member.email}</span>
                </div>
                <Badge tone={member.role === "owner" ? "info" : "neutral"}>
                  {roleLabels[member.role]}
                </Badge>
              </div>
              <div className="member-card__meta">
                <article className="summary-tile">
                  <strong>Escopo</strong>
                  <span>{member.role === "viewer" ? "Leitura" : "Operacao"}</span>
                </article>
                <article className="summary-tile">
                  <strong>Responsabilidade</strong>
                  <span>{member.role === "owner" ? "Principal" : roleLabels[member.role]}</span>
                </article>
              </div>
              {member.role === "owner" ? (
                <p className="member-card__note">Responsavel principal pelo workspace.</p>
              ) : (
                <div className="inline-actions member-card__actions">
                  <label className="inline-select">
                    Papel
                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(member.id, event.target.value as Membership["role"])
                      }
                    >
                      <option value="admin">Admin</option>
                      <option value="coordinator">Coordenacao</option>
                      <option value="analyst">Analise</option>
                      <option value="viewer">Leitura</option>
                    </select>
                  </label>
                  <button
                    className="inline-button"
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remover
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OnboardingPage() {
  const { tokens } = useAuth();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [profileType, setProfileType] = useState("campaign");
  const [objective, setObjective] = useState("ativar workspace");

  const loadData = useCallback(async () => {
    if (!tokens?.access_token) return;
    const [onboardingState, campaignList, membershipList, opponentList] = await Promise.all([
      api.getOnboarding(tokens.access_token),
      api.listCampaigns(tokens.access_token),
      api.listMemberships(tokens.access_token),
      api.listOpponents(tokens.access_token),
    ]);
    setState(onboardingState);
    setCampaigns(campaignList);
    setMemberships(membershipList);
    setOpponents(opponentList);
    setProfileType(onboardingState.profile_type ?? "campaign");
    setObjective(onboardingState.objective ?? "ativar workspace");
  }, [tokens]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCampaignSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const campaign = await api.createCampaign(tokens.access_token, {
        name: String(formData.get("name") ?? ""),
        office: String(formData.get("office") ?? ""),
        city: String(formData.get("city") ?? "") || null,
        state: String(formData.get("state") ?? "") || null,
        phase: String(formData.get("phase") ?? "pre_campaign"),
      });
      await api.updateOnboarding(tokens.access_token, {
        profile_type: profileType,
        objective,
        campaign_id: campaign.id,
      });
      form.reset();
      await loadData();
      setMessage("Campanha inicial registrada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar onboarding.");
    }
  }

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.inviteMember(tokens.access_token, {
        email: String(formData.get("email") ?? ""),
        full_name: String(formData.get("full_name") ?? ""),
        role: String(formData.get("role") ?? "analyst"),
      });
      form.reset();
      await loadData();
      setMessage("Equipe inicial configurada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao configurar equipe.");
    }
  }

  async function handleOpponentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createOpponent(tokens.access_token, {
        name: String(formData.get("name") ?? ""),
        context: String(formData.get("context") ?? ""),
        links: String(formData.get("links") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: String(formData.get("notes") ?? "") || null,
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      form.reset();
      await loadData();
      setMessage("Primeiro adversario registrado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao registrar adversario.");
    }
  }

  const checklist = [
    {
      id: "campaign",
      label: "Campanha inicial",
      done: Boolean(state?.campaign_id),
      detail: state?.campaign_id
        ? `${campaigns.length} campanha(s) cadastrada(s)`
        : "Crie a primeira campanha",
    },
    {
      id: "team",
      label: "Equipe inicial",
      done: Boolean(state?.team_configured),
      detail:
        memberships.length > 1
          ? `${memberships.length - 1} convite(s) alem do owner`
          : "Convide pelo menos uma pessoa da operacao",
    },
    {
      id: "opponent",
      label: "Primeiro adversario",
      done: Boolean(state?.first_opponent_created),
      detail: opponents.length
        ? `${opponents.length} adversario(s) mapeado(s)`
        : "Registre um primeiro monitorado",
    },
  ];
  const completedSteps = checklist.filter((item) => item.done).length;
  const progressPercent = Math.round((completedSteps / checklist.length) * 100);
  const nextPendingStep = checklist.find((item) => !item.done);
  const contextualMessage = state?.completed
    ? "Workspace ativado. O proximo movimento natural e alimentar contatos, tarefas e relatorios para sair do modo setup."
    : nextPendingStep?.id === "campaign"
      ? "Comece pela campanha inicial. Isso define o contexto do workspace e deixa o dashboard menos generico."
      : nextPendingStep?.id === "team"
        ? "Agora convide a equipe principal. Mesmo um unico coordenador ja melhora o uso real do workspace."
        : nextPendingStep?.id === "opponent"
          ? "Feche o onboarding registrando o primeiro adversario. Isso libera um caso real de monitoramento."
          : "Revise os dados iniciais para garantir que o workspace esteja pronto para a operacao.";
  const recommendationCards = [
    {
      title: "Proximo passo",
      content: nextPendingStep ? nextPendingStep.label : "Onboarding concluido",
    },
    {
      title: "Foco agora",
      content: nextPendingStep?.detail ?? "Comece a estruturar contatos e tarefas do dia.",
    },
    {
      title: "Progresso",
      content: `${progressPercent}% do onboarding inicial concluido`,
    },
  ];

  return (
    <section className="app-section onboarding-layout">
      <div className="panel onboarding-summary">
        <div className="section-header">
          <div>
            <p className="eyebrow">Checklist inicial</p>
            <h2>Ative o workspace sem sair do fluxo</h2>
          </div>
          <Badge tone={state?.completed ? "success" : "warning"}>
            {`${completedSteps}/3 concluido${completedSteps === 1 ? "" : "s"}`}
          </Badge>
        </div>
        {message ? <div className="info-box">{message}</div> : null}
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="meta-copy">{contextualMessage}</p>
        </div>
        <div className="list-grid">
          {checklist.map((item) => (
            <article className="list-card onboarding-step" key={item.id}>
              <div className="section-header">
                <strong>{item.label}</strong>
                <Badge tone={item.done ? "success" : "neutral"}>
                  {item.done ? "feito" : "pendente"}
                </Badge>
              </div>
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
        <div className="list-grid onboarding-state-grid">
          <article className="list-card">
            <strong>Perfil</strong>
            <span>{state?.profile_type ?? "nao definido"}</span>
          </article>
          <article className="list-card">
            <strong>Objetivo</strong>
            <span>{state?.objective ?? "nao definido"}</span>
          </article>
          <article className="list-card">
            <strong>Status final</strong>
            <span>{state?.completed ? "onboarding concluido" : "em andamento"}</span>
          </article>
        </div>
        <div className="list-grid onboarding-guidance-grid">
          {recommendationCards.map((item) => (
            <article className="list-card onboarding-guidance" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.content}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="onboarding-forms">
        <form className="panel form-panel" onSubmit={handleCampaignSubmit}>
          <h2>1. Criar campanha</h2>
          <label>
            Perfil de uso
            <select value={profileType} onChange={(event) => setProfileType(event.target.value)}>
              <option value="campaign">Campanha</option>
              <option value="mandate">Mandato</option>
              <option value="consultancy">Consultoria</option>
            </select>
          </label>
          <label>
            Objetivo inicial
            <input
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              required
              minLength={3}
            />
          </label>
          <label>
            Nome da campanha
            <input name="name" required minLength={2} />
          </label>
          <label>
            Cargo
            <input name="office" required minLength={2} />
          </label>
          <label>
            Cidade
            <input name="city" />
          </label>
          <label>
            Estado
            <input name="state" />
          </label>
          <label>
            Fase
            <select name="phase" defaultValue="pre_campaign">
              <option value="pre_campaign">Pre-campanha</option>
              <option value="campaign">Campanha</option>
              <option value="mandate">Mandato</option>
            </select>
          </label>
          <Button type="submit" label="Salvar campanha inicial" />
        </form>

        <form className="panel form-panel" onSubmit={handleInviteSubmit}>
          <h2>2. Convidar equipe</h2>
          <label>
            Nome completo
            <input name="full_name" required minLength={3} />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Role
            <select name="role" defaultValue="analyst">
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinator</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <Button type="submit" label="Adicionar membro inicial" />
        </form>

        <form className="panel form-panel" onSubmit={handleOpponentSubmit}>
          <h2>3. Registrar adversario</h2>
          <label>
            Nome
            <input name="name" required minLength={2} />
          </label>
          <label>
            Contexto
            <input name="context" required minLength={2} />
          </label>
          <label>
            Links
            <input name="links" placeholder="https://perfil1, https://perfil2" />
          </label>
          <label>
            Tags
            <input name="tags" placeholder="bairro, digital, situacao" />
          </label>
          <label>
            Observacoes
            <textarea name="notes" rows={4} />
          </label>
          <Button type="submit" label="Salvar primeiro adversario" />
        </form>
      </div>

      <div className="panel">
        <div className="section-header">
          <h2>Resumo operacional</h2>
        </div>
        <div className="list-grid onboarding-results">
          <article className="list-card">
            <strong>Campanhas</strong>
            <span>{campaigns.length}</span>
            <span>
              {campaigns[0]
                ? `${campaigns[0].name} · ${campaigns[0].office}`
                : "Nenhuma campanha criada"}
            </span>
          </article>
          <article className="list-card">
            <strong>Equipe</strong>
            <span>{memberships.length} membro(s)</span>
            <span>
              {memberships.length > 1
                ? memberships
                    .slice(1)
                    .map((member) => member.full_name)
                    .join(", ")
                : "Somente owner"}
            </span>
          </article>
          <article className="list-card">
            <strong>Adversarios</strong>
            <span>{opponents.length} monitorado(s)</span>
            <span>{opponents[0] ? opponents[0].name : "Nenhum adversario registrado"}</span>
          </article>
        </div>
      </div>
    </section>
  );
}

function ContactsPage() {
  const { tokens } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const statusLabels: Record<Contact["status"], string> = {
    new: "Novo",
    contacted: "Contatado",
    qualified: "Qualificado",
    priority: "Prioritario",
    inactive: "Inativo",
  };

  const loadContacts = useCallback(async () => {
    if (!tokens?.access_token) return;
    try {
      setContacts(
        await api.listContacts(tokens.access_token, {
          query: search,
          kind: kindFilter,
          status: statusFilter,
          tag: tagFilter,
          city: cityFilter,
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar contatos.");
    }
  }, [cityFilter, kindFilter, search, statusFilter, tagFilter, tokens]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createContact(tokens.access_token, {
        name: String(formData.get("name") ?? ""),
        kind: String(formData.get("kind") ?? "lead"),
        status: String(formData.get("status") ?? "new"),
        email: String(formData.get("email") ?? "") || null,
        phone: String(formData.get("phone") ?? "") || null,
        city: String(formData.get("city") ?? "") || null,
        notes: String(formData.get("notes") ?? "") || null,
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      form.reset();
      await loadContacts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao criar contato.");
    }
  }

  async function handleStatusChange(contactId: string, status: Contact["status"]) {
    if (!tokens?.access_token) return;
    try {
      await api.updateContact(tokens.access_token, contactId, { status });
      await loadContacts();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Falha ao atualizar status do contato.",
      );
    }
  }

  async function handleDelete(contactId: string) {
    if (!tokens?.access_token) return;
    try {
      await api.deleteContact(tokens.access_token, contactId);
      await loadContacts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao remover contato.");
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>, contactId: string) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;

    try {
      await api.addContactNote(tokens.access_token, contactId, { content });
      form.reset();
      await loadContacts();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao registrar nota.");
    }
  }

  const groupedByStatus = contacts.reduce<Record<Contact["status"], number>>(
    (accumulator, contact) => {
      accumulator[contact.status] += 1;
      return accumulator;
    },
    { new: 0, contacted: 0, qualified: 0, priority: 0, inactive: 0 },
  );

  return (
    <section className="app-section split-layout contacts-layout">
      <form className="panel form-panel entity-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="eyebrow">CRM politico</p>
          <h2>Novo contato</h2>
        </div>
        <label>
          Nome
          <input name="name" required minLength={2} />
        </label>
        <label>
          Tipo
          <select name="kind" defaultValue="lead">
            <option value="lead">Lead</option>
            <option value="supporter">Apoiador</option>
            <option value="leadership">Lideranca</option>
            <option value="press">Imprensa</option>
            <option value="partner">Parceiro</option>
            <option value="supplier">Fornecedor</option>
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue="new">
            <option value="new">Novo</option>
            <option value="contacted">Contatado</option>
            <option value="qualified">Qualificado</option>
            <option value="priority">Prioritario</option>
            <option value="inactive">Inativo</option>
          </select>
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Telefone
          <input name="phone" />
        </label>
        <label>
          Cidade
          <input name="city" />
        </label>
        <label>
          Tags
          <input name="tags" placeholder="bairro, lideranca, imprensa" />
        </label>
        <label>
          Observacoes
          <textarea name="notes" rows={4} />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <Button type="submit" label="Salvar contato" />
      </form>

      <div className="panel contacts-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Visao da base</p>
            <h2>Contatos</h2>
          </div>
          <span>{contacts.length} registros</span>
        </div>
        <div className="list-grid contact-status-grid summary-grid">
          {Object.entries(groupedByStatus).map(([status, count]) => (
            <article className="summary-tile" key={status}>
              <strong>{statusLabels[status as Contact["status"]]}</strong>
              <span>{count} contato(s)</span>
            </article>
          ))}
        </div>
        <div className="toolbar toolbar-wide contact-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, cidade, tag, email, telefone ou historico"
          />
          <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="lead">Lead</option>
            <option value="supporter">Apoiador</option>
            <option value="leadership">Lideranca</option>
            <option value="press">Imprensa</option>
            <option value="partner">Parceiro</option>
            <option value="supplier">Fornecedor</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos os status</option>
            <option value="new">Novo</option>
            <option value="contacted">Contatado</option>
            <option value="qualified">Qualificado</option>
            <option value="priority">Prioritario</option>
            <option value="inactive">Inativo</option>
          </select>
          <input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="Filtrar por tag"
          />
          <input
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
            placeholder="Filtrar por cidade"
          />
          <button
            className="inline-button"
            type="button"
            onClick={() => {
              setSearch("");
              setKindFilter("");
              setStatusFilter("");
              setTagFilter("");
              setCityFilter("");
            }}
          >
            Limpar filtros
          </button>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="list-grid contacts-records">
          {contacts.length === 0 ? <p className="meta-copy">Nenhum contato cadastrado.</p> : null}
          {contacts.map((contact) => (
            <article className="list-card contact-record" key={contact.id}>
              <div className="section-header">
                <div className="contact-heading">
                  <strong>{contact.name}</strong>
                  <span className="meta-copy">
                    Atualizado em {new Date(contact.updated_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="contact-badges">
                  <Badge tone="neutral">{contact.kind}</Badge>
                  <Badge
                    tone={
                      contact.status === "priority"
                        ? "warning"
                        : contact.status === "qualified"
                          ? "success"
                          : "info"
                    }
                  >
                    {statusLabels[contact.status]}
                  </Badge>
                </div>
              </div>
              <span>{contact.email || contact.phone || "Sem contato principal"}</span>
              <span className="meta-copy">{contact.city || "Cidade nao informada"}</span>
              {contact.tags?.length ? <p>{contact.tags.join(", ")}</p> : null}
              <div className="inline-actions contact-actions">
                <label className="inline-select">
                  Status
                  <select
                    value={contact.status}
                    onChange={(event) =>
                      handleStatusChange(contact.id, event.target.value as Contact["status"])
                    }
                  >
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="priority">Prioritario</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </label>
              </div>
              <div className="note-history">
                <strong>Historico</strong>
                {contact.note_history?.length ? (
                  contact.note_history.slice(0, 4).map((note) => (
                    <div className="note-entry" key={note.id}>
                      <p>{note.content}</p>
                      <span>{new Date(note.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                  ))
                ) : (
                  <span className="meta-copy">Sem anotacoes registradas.</span>
                )}
              </div>
              <form className="compact-form" onSubmit={(event) => handleAddNote(event, contact.id)}>
                <Input label="Nova nota" name="content" multiline rows={3} />
                <Button type="submit" label="Adicionar nota" variant="secondary" />
              </form>
              <button
                className="inline-button"
                type="button"
                onClick={() => handleDelete(contact.id)}
              >
                Remover
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TasksPage() {
  const { tokens } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const statusLabels: Record<Task["status"], string> = {
    backlog: "Backlog",
    in_progress: "Em andamento",
    waiting_review: "Em validacao",
    done: "Concluido",
  };
  const priorityLabels: Record<Task["priority"], string> = {
    low: "Baixa",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const overdueTasks = tasks.filter(
    (task) => task.due_date && task.status !== "done" && new Date(task.due_date) < new Date(),
  ).length;
  const urgentTasks = tasks.filter(
    (task) => task.priority === "urgent" && task.status !== "done",
  ).length;
  const assignedTasks = tasks.filter((task) => Boolean(task.assignee_name)).length;

  const loadTasks = useCallback(async () => {
    if (!tokens?.access_token) return;
    try {
      setTasks(
        await api.listTasks(tokens.access_token, {
          query: search,
          status: statusFilter,
          priority: priorityFilter,
        }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar tarefas.");
    }
  }, [priorityFilter, search, statusFilter, tokens]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createTask(tokens.access_token, {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "") || null,
        status: String(formData.get("status") ?? "backlog"),
        priority: String(formData.get("priority") ?? "medium"),
        assignee_name: String(formData.get("assignee_name") ?? "") || null,
        due_date: String(formData.get("due_date") ?? "") || null,
      });
      form.reset();
      await loadTasks();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao criar tarefa.");
    }
  }

  async function moveTask(taskId: string, currentStatus: string) {
    if (!tokens?.access_token) return;
    const nextStatus =
      currentStatus === "backlog"
        ? "in_progress"
        : currentStatus === "in_progress"
          ? "waiting_review"
          : currentStatus === "waiting_review"
            ? "done"
            : "backlog";

    try {
      await api.updateTask(tokens.access_token, taskId, { status: nextStatus });
      await loadTasks();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Falha ao mover tarefa.");
    }
  }

  async function handleDelete(taskId: string) {
    if (!tokens?.access_token) return;
    try {
      await api.deleteTask(tokens.access_token, taskId);
      await loadTasks();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao remover tarefa.");
    }
  }

  return (
    <section className="app-section split-layout tasks-layout">
      <form className="panel form-panel entity-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <p className="eyebrow">Ritmo operacional</p>
          <h2>Nova tarefa</h2>
          <p className="meta-copy">
            Registre entregas com dono, prazo e prioridade para manter o board com leitura
            executiva, e nao so lista solta.
          </p>
        </div>
        <label>
          Titulo
          <input name="title" required minLength={3} />
        </label>
        <label>
          Descricao
          <textarea name="description" rows={4} />
        </label>
        <label>
          Status
          <select name="status" defaultValue="backlog">
            <option value="backlog">Backlog</option>
            <option value="in_progress">Em andamento</option>
            <option value="waiting_review">Aguardando validacao</option>
            <option value="done">Concluido</option>
          </select>
        </label>
        <label>
          Prioridade
          <select name="priority" defaultValue="medium">
            <option value="low">Baixa</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </label>
        <label>
          Responsavel
          <input name="assignee_name" />
        </label>
        <label>
          Vencimento
          <input name="due_date" type="date" />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="list-grid summary-grid">
          <article className="summary-tile">
            <strong>Tarefas abertas</strong>
            <span>{openTasks}</span>
          </article>
          <article className="summary-tile">
            <strong>Urgentes</strong>
            <span>{urgentTasks}</span>
          </article>
        </div>
        <Button type="submit" label="Salvar tarefa" />
      </form>

      <div className="panel tasks-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Board operacional</p>
            <h2>Tarefas</h2>
          </div>
          <span>{tasks.length} registros</span>
        </div>
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Abertas</strong>
            <span>{openTasks}</span>
          </article>
          <article className="summary-tile">
            <strong>Vencidas</strong>
            <span>{overdueTasks}</span>
          </article>
          <article className="summary-tile">
            <strong>Com responsavel</strong>
            <span>{assignedTasks}</span>
          </article>
          <article className="summary-tile">
            <strong>Urgentes</strong>
            <span>{urgentTasks}</span>
          </article>
        </div>
        <div className="toolbar toolbar-wide">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por titulo, descricao ou responsavel"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos os status</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">Em andamento</option>
            <option value="waiting_review">Aguardando validacao</option>
            <option value="done">Concluido</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">Todas prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div className="kanban-grid task-board-grid">
          {(["backlog", "in_progress", "waiting_review", "done"] as Task["status"][]).map(
            (status) => {
              const tasksByStatus = tasks.filter((task) => task.status === status);
              return (
                <div key={status} className="kanban-column task-board-column">
                  <div className="section-header">
                    <h3>{statusLabels[status]}</h3>
                    <span>{tasksByStatus.length}</span>
                  </div>
                  <div className="list-grid task-column-records">
                    {tasksByStatus.length === 0 ? (
                      <article className="list-card task-card task-card--empty">
                        <strong>Sem tarefas nesta etapa</strong>
                        <p>Mantenha esta coluna vazia ou puxe uma entrega para seguir o fluxo.</p>
                      </article>
                    ) : null}
                    {tasksByStatus.map((task) => (
                      <article className="list-card task-card" key={task.id}>
                        <div className="section-header">
                          <strong>{task.title}</strong>
                          <Badge tone={task.priority === "urgent" ? "warning" : "neutral"}>
                            {priorityLabels[task.priority]}
                          </Badge>
                        </div>
                        <p>{task.description || "Sem descricao adicional."}</p>
                        <div className="task-card__meta">
                          <span>{task.assignee_name || "Sem responsavel"}</span>
                          <span>
                            {task.due_date
                              ? `Entrega ${new Date(task.due_date).toLocaleDateString("pt-BR")}`
                              : "Sem vencimento"}
                          </span>
                        </div>
                        <div className="inline-actions task-card__actions">
                          <button
                            className="inline-button"
                            type="button"
                            onClick={() => moveTask(task.id, task.status)}
                          >
                            {task.status === "done" ? "Reabrir" : "Avancar etapa"}
                          </button>
                          <button
                            className="inline-button"
                            type="button"
                            onClick={() => handleDelete(task.id)}
                          >
                            Remover
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

function AuditPage() {
  const { tokens } = useAuth();
  const [logs, setLogs] = useState<
    Array<{ id: string; action: string; resource_type: string; created_at: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const uniqueResources = new Set(logs.map((log) => log.resource_type)).size;
  const latestLog = logs[0] ?? null;
  const recentLogs = logs.filter(
    (log) => Date.now() - new Date(log.created_at).getTime() <= 1000 * 60 * 60 * 24,
  ).length;

  useEffect(() => {
    if (!tokens?.access_token) return;
    void api
      .listAuditLogs(tokens.access_token)
      .then(setLogs)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Falha ao carregar auditoria."),
      );
  }, [tokens]);

  return (
    <section className="app-section audit-layout">
      <div className="panel audit-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Governanca e rastreabilidade</p>
            <h2>Auditoria</h2>
          </div>
          <span>{logs.length} eventos</span>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Eventos totais</strong>
            <span>{logs.length}</span>
          </article>
          <article className="summary-tile">
            <strong>Recursos rastreados</strong>
            <span>{uniqueResources}</span>
          </article>
          <article className="summary-tile">
            <strong>Ultimas 24h</strong>
            <span>{recentLogs}</span>
          </article>
          <article className="summary-tile">
            <strong>Ultimo sinal</strong>
            <span>
              {latestLog ? new Date(latestLog.created_at).toLocaleDateString("pt-BR") : "Sem logs"}
            </span>
          </article>
        </div>
        <div className="audit-intro">
          <p className="meta-copy">
            Cada movimento relevante do workspace fica registrado para sustentar continuidade,
            leitura de risco e rastreabilidade operacional.
          </p>
        </div>
        <div className="list-grid audit-records">
          {logs.length === 0 ? (
            <article className="list-card audit-card">
              <strong>Nenhum evento registrado ainda</strong>
              <p>
                Assim que contatos, tarefas, billing ou equipe forem movimentados, os sinais
                aparecem aqui.
              </p>
            </article>
          ) : null}
          {logs.map((log) => (
            <article className="list-card audit-card" key={log.id}>
              <div className="section-header">
                <strong>{log.action}</strong>
                <Badge tone="neutral">{log.resource_type}</Badge>
              </div>
              <div className="audit-card__meta">
                <span>Recurso: {log.resource_type}</span>
                <span>{new Date(log.created_at).toLocaleString("pt-BR")}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsPage() {
  const { tokens } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState("");

  const loadReports = useCallback(async () => {
    if (!tokens?.access_token) return;
    setReports(
      await api.listReports(tokens.access_token, { report_type: reportTypeFilter || undefined }),
    );
  }, [reportTypeFilter, tokens]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const totals = reports.reduce(
    (accumulator, report) => {
      accumulator.openTasks += report.metrics.open_tasks_count;
      accumulator.priorityContacts += report.metrics.priority_contacts_count;
      accumulator.overdueTasks += report.metrics.overdue_tasks_count;
      return accumulator;
    },
    { openTasks: 0, priorityContacts: 0, overdueTasks: 0 },
  );

  async function handleCreateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createReport(tokens.access_token, {
        title: String(formData.get("title") ?? ""),
        report_type: String(formData.get("report_type") ?? "operational"),
      });
      form.reset();
      await loadReports();
      setMessage("Relatorio gerado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao gerar relatorio.");
    }
  }

  async function handleExport(reportId: string, format: "pdf" | "csv") {
    if (!tokens?.access_token) return;
    try {
      const exported = await api.exportReport(tokens.access_token, reportId, format);
      setExportPreview(`${exported.filename}\n\n${exported.content}`);
      await loadReports();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao exportar relatorio.");
    }
  }

  return (
    <section className="app-section split-layout reports-layout">
      <form className="panel form-panel entity-form" onSubmit={handleCreateReport}>
        <div className="section-heading">
          <p className="eyebrow">Relatoria</p>
          <h2>Novo relatorio</h2>
        </div>
        <label>
          Titulo
          <input name="title" required minLength={2} />
        </label>
        <label>
          Tipo
          <select name="report_type" defaultValue="operational">
            <option value="operational">Operacional</option>
            <option value="executive">Executivo</option>
            <option value="comparative">Comparativo</option>
            <option value="opponents">Adversarios</option>
            <option value="ai_summary">Resumo IA</option>
          </select>
        </label>
        {message ? <div className="info-box">{message}</div> : null}
        <Button type="submit" label="Gerar relatorio" />
      </form>

      <div className="panel reports-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Leitura consolidada</p>
            <h2>Relatorios</h2>
          </div>
          <span>{reports.length}</span>
        </div>
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Tarefas abertas</strong>
            <span>{totals.openTasks}</span>
          </article>
          <article className="summary-tile">
            <strong>Contatos prioritarios</strong>
            <span>{totals.priorityContacts}</span>
          </article>
          <article className="summary-tile">
            <strong>Tarefas vencidas</strong>
            <span>{totals.overdueTasks}</span>
          </article>
        </div>
        <div className="toolbar">
          <select
            value={reportTypeFilter}
            onChange={(event) => setReportTypeFilter(event.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="operational">Operacional</option>
            <option value="executive">Executivo</option>
            <option value="comparative">Comparativo</option>
            <option value="opponents">Adversarios</option>
            <option value="ai_summary">Resumo IA</option>
          </select>
        </div>
        <div className="list-grid report-records">
          {reports.map((report) => (
            <article className="list-card report-card" key={report.id}>
              <div className="section-header">
                <strong>{report.title}</strong>
                <Badge tone="neutral">{report.report_type}</Badge>
              </div>
              <p>{report.summary}</p>
              <div className="list-grid onboarding-guidance-grid report-metrics-grid">
                <article className="summary-tile">
                  <strong>Contatos</strong>
                  <span>{report.metrics.contacts_count}</span>
                </article>
                <article className="summary-tile">
                  <strong>Prioritarios</strong>
                  <span>{report.metrics.priority_contacts_count}</span>
                </article>
                <article className="summary-tile">
                  <strong>Tarefas abertas</strong>
                  <span>{report.metrics.open_tasks_count}</span>
                </article>
                <article className="summary-tile">
                  <strong>Vencidas</strong>
                  <span>{report.metrics.overdue_tasks_count}</span>
                </article>
              </div>
              <div className="inline-actions">
                <button
                  className="inline-button"
                  type="button"
                  onClick={() => handleExport(report.id, "pdf")}
                >
                  Exportar PDF
                </button>
                <button
                  className="inline-button"
                  type="button"
                  onClick={() => handleExport(report.id, "csv")}
                >
                  Exportar CSV
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel report-preview-panel">
        <div className="section-header">
          <h2>Preview exportado</h2>
        </div>
        <pre className="export-preview">{exportPreview ?? "Nenhum export realizado."}</pre>
      </div>
    </section>
  );
}

function BillingPage() {
  const { tokens } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [events, setEvents] = useState<BillingEvent[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!tokens?.access_token) return;
    const [subscriptionPayload, plansPayload, eventsPayload] = await Promise.all([
      api.getSubscription(tokens.access_token),
      api.listPlans(tokens.access_token),
      api.listBillingEvents(tokens.access_token),
    ]);
    setSubscription(subscriptionPayload);
    setPlans(plansPayload);
    setEvents(eventsPayload);
  }, [tokens]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  async function activatePlan(plan: Subscription["plan"]) {
    if (!tokens?.access_token) return;
    try {
      const response = await api.checkout(tokens.access_token, { plan });
      setMessage(response.message);
      await loadSubscription();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao ativar plano.");
    }
  }

  async function handleSubscriptionAction(
    action:
      | "cancel"
      | "reactivate"
      | "renew_trial"
      | "mark_past_due"
      | "retry_charge"
      | "resolve_past_due"
      | "expire_subscription"
      | "switch_to_annual"
      | "switch_to_monthly",
  ) {
    if (!tokens?.access_token) return;
    try {
      const response = await api.subscriptionAction(tokens.access_token, action);
      setMessage(response.message);
      await loadSubscription();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar assinatura.");
    }
  }

  return (
    <section className="app-section billing-layout">
      <div className="panel billing-overview">
        <div className="section-header">
          <div>
            <p className="eyebrow">Leitura comercial</p>
            <h2>Assinatura</h2>
          </div>
          <Badge
            tone={
              subscription?.status === "past_due"
                ? "warning"
                : subscription?.status === "canceled"
                  ? "neutral"
                  : "success"
            }
          >
            {subscription?.commercial_status ?? "carregando"}
          </Badge>
        </div>
        <div className="billing-hero-strip">
          <article className="brief-card">
            <strong>Estagio de cobranca</strong>
            <span>{subscription?.collection_stage ?? "-"}</span>
          </article>
          <article className="brief-card">
            <strong>Proxima acao comercial</strong>
            <span>{subscription?.next_commercial_action ?? "-"}</span>
          </article>
          <article className="brief-card">
            <strong>Tentativas falhas</strong>
            <span>{subscription?.failed_payments_count ?? 0}</span>
          </article>
          <article className="brief-card">
            <strong>Risco de renovacao</strong>
            <span>{subscription?.renewal_risk ?? "-"}</span>
          </article>
          <article className="brief-card">
            <strong>Movimento comercial</strong>
            <span>{subscription?.commercial_motion ?? "-"}</span>
          </article>
          <article className="brief-card">
            <strong>Ciclo recomendado</strong>
            <span>{subscription?.recommended_billing_cycle ?? "-"}</span>
          </article>
        </div>
        <div className="billing-stat-grid">
          <article className="stat-tile">
            <strong>Plano</strong>
            <span>{subscription?.plan ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Status</strong>
            <span>{subscription?.status ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Leitura comercial</strong>
            <span>{subscription?.commercial_status ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Ciclo</strong>
            <span>{subscription?.billing_cycle ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Trial ate</strong>
            <span>{subscription?.trial_ends_at ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Proxima referencia</strong>
            <span>{subscription?.next_billing_at ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Graca ate</strong>
            <span>{subscription?.grace_period_ends_at ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Dias de graca</strong>
            <span>{subscription?.grace_days_remaining ?? 0}</span>
          </article>
          <article className="stat-tile">
            <strong>Dias restantes</strong>
            <span>{subscription?.trial_days_remaining ?? 0}</span>
          </article>
          <article className="stat-tile">
            <strong>Exportacoes restantes</strong>
            <span>{subscription?.report_exports_limit ?? 0}</span>
          </article>
          <article className="stat-tile">
            <strong>Usuarios incluidos</strong>
            <span>{subscription?.seats_included ?? 0}</span>
          </article>
          <article className="stat-tile">
            <strong>Assentos ocupados</strong>
            <span>{subscription?.seat_usage_count ?? 0}</span>
          </article>
          <article className="stat-tile">
            <strong>Ocupacao</strong>
            <span>{Math.round((subscription?.seat_usage_ratio ?? 0) * 100)}%</span>
          </article>
          <article className="stat-tile">
            <strong>Pressao de assentos</strong>
            <span>{subscription?.seat_pressure ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Plano sugerido</strong>
            <span>{subscription?.suggested_plan ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Cancelamento agendado</strong>
            <span>{subscription?.cancel_at_period_end ? "Sim" : "Nao"}</span>
          </article>
          <article className="stat-tile">
            <strong>Ultima tentativa</strong>
            <span>{subscription?.last_payment_attempt_at ?? "-"}</span>
          </article>
        </div>
        {message ? <div className="info-box">{message}</div> : null}
        <div className="billing-brief-grid">
          <article className="brief-card">
            <strong>Uso de IA</strong>
            <span>{subscription?.ai_requests_limit ?? 0} requisicoes</span>
          </article>
          <article className="brief-card">
            <strong>Exportacao</strong>
            <span>{subscription?.can_export_reports ? "Disponivel" : "Bloqueada"}</span>
          </article>
          <article className="brief-card">
            <strong>Capacidade de equipe</strong>
            <span>
              {subscription?.seat_usage_count ?? 0}/{subscription?.seats_included ?? 0} assentos
            </span>
          </article>
          <article className="brief-card brief-card--wide">
            <strong>Leitura comercial</strong>
            <span>
              {subscription?.status === "canceled"
                ? "Conta encerrada localmente. O proximo passo e decidir por reativacao ou novo ciclo comercial."
                : subscription?.grace_days_remaining
                  ? `Conta em janela de graca com ${subscription.grace_days_remaining} dia(s) para regularizacao.`
                  : subscription?.cancel_at_period_end
                    ? `Cancelamento previsto para ${subscription.current_period_ends_at ?? "o fim do periodo atual"}.`
                    : subscription?.status === "past_due"
                      ? "Conta em pendencia. Priorize regularizacao antes de ampliar o uso."
                      : subscription?.trial_days_remaining
                        ? `Trial em andamento com ${subscription.trial_days_remaining} dia(s) restante(s).`
                        : "Conta pronta para conversao, renovacao ou upgrade de plano."}
            </span>
          </article>
        </div>
        <div className="inline-actions billing-actions">
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("renew_trial")}
          >
            Renovar trial
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("mark_past_due")}
          >
            Marcar pendencia
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("retry_charge")}
          >
            Tentar cobranca
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("resolve_past_due")}
          >
            Resolver pendencia
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("reactivate")}
          >
            Reativar
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("cancel")}
          >
            Cancelar
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("switch_to_annual")}
          >
            Migrar para anual
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("switch_to_monthly")}
          >
            Voltar para mensal
          </button>
          <button
            className="inline-button"
            type="button"
            onClick={() => handleSubscriptionAction("expire_subscription")}
          >
            Encerrar conta
          </button>
        </div>
      </div>

      <div className="panel billing-strategy">
        <div className="section-heading">
          <p className="eyebrow">Escala comercial</p>
          <h2>Planos</h2>
        </div>
        <div className="billing-plan-grid">
          {plans.map((plan) => (
            <article className="billing-plan-card" key={plan.plan}>
              <strong>{plan.plan}</strong>
              <div className="billing-plan-meta">
                <span>{plan.seats_included} usuario(s)</span>
                <span>{plan.report_exports_limit} exportacao(oes)</span>
                <span>{plan.ai_requests_limit} requisicao(oes) IA</span>
              </div>
              <p>{plan.recommended_for}</p>
              <button
                className="inline-button"
                type="button"
                onClick={() => activatePlan(plan.plan)}
              >
                Migrar para este plano
              </button>
            </article>
          ))}
        </div>
        <div className="section-header">
          <h2>Historico comercial</h2>
        </div>
        <div className="billing-event-timeline">
          {events.length === 0 ? (
            <p className="meta-copy">Nenhum evento comercial registrado ainda.</p>
          ) : (
            events.slice(0, 6).map((event) => (
              <article className="timeline-card" key={event.id}>
                <div className="timeline-dot" />
                <div className="timeline-card__content">
                  <strong>{event.title}</strong>
                  <span>{new Date(event.created_at).toLocaleString("pt-BR")}</span>
                  <p>{event.detail}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function LeadsPage() {
  const { tokens } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [leadQuery, setLeadQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const loadLeads = useCallback(async () => {
    if (!tokens?.access_token) return;
    const nextLeads = await api.listLeads(tokens.access_token, {
      query: leadQuery || undefined,
      stage: stageFilter || undefined,
      owner_user_id: ownerFilter || undefined,
    });
    setLeads(nextLeads);
  }, [leadQuery, ownerFilter, stageFilter, tokens]);
  const recentLeads = leads.filter(
    (lead) => Date.now() - new Date(lead.created_at).getTime() <= 1000 * 60 * 60 * 24 * 7,
  ).length;
  const leadsWithPhone = leads.filter((lead) => Boolean(lead.phone)).length;
  const leadsWithCity = leads.filter((lead) => Boolean(lead.city)).length;
  const convertedLeads = leads.filter((lead) => Boolean(lead.converted_contact_id)).length;
  const followUpsPlanned = leads.filter((lead) => Boolean(lead.follow_up_at)).length;
  const todayIso = new Date().toISOString().slice(0, 10);
  const overdueFollowUps = leads.filter(
    (lead) =>
      Boolean(lead.follow_up_at) &&
      !lead.converted_contact_id &&
      (lead.follow_up_at ?? "") < todayIso,
  ).length;
  const dueTodayFollowUps = leads.filter(
    (lead) =>
      Boolean(lead.follow_up_at) && !lead.converted_contact_id && lead.follow_up_at === todayIso,
  ).length;
  const hotLeads = leads.filter(
    (lead) =>
      !lead.converted_contact_id && ["qualified", "follow_up", "proposal"].includes(lead.stage),
  ).length;
  const criticalQueue = leads.filter(
    (lead) => !lead.converted_contact_id && ["high", "critical"].includes(lead.priority_label),
  ).length;
  const leadBuckets = [
    {
      key: "overdue",
      eyebrow: "Risco imediato",
      title: "Atrasados",
      description: "Follow-ups vencidos e pressao comercial que pede resposta agora.",
    },
    {
      key: "today",
      eyebrow: "Hoje",
      title: "Vencem hoje",
      description: "Janela de resposta ativa. Ideal para fechar proximo passo ainda neste ciclo.",
    },
    {
      key: "this_week",
      eyebrow: "Cadencia",
      title: "Esta semana",
      description: "Leads ja em movimento, mas ainda dentro da faixa segura de abordagem.",
    },
    {
      key: "later",
      eyebrow: "Pipeline",
      title: "Mais a frente",
      description: "Oportunidades em acompanhamento, com janela de follow-up futura.",
    },
    {
      key: "unscheduled",
      eyebrow: "Triagem",
      title: "Sem agenda",
      description:
        "Entradas sem dono ou sem proxima data definida. Aqui mora o atrito operacional.",
    },
    {
      key: "converted",
      eyebrow: "Fechados",
      title: "Convertidos",
      description: "Leads que ja viraram relacao ativa no CRM e sairam da fila comercial.",
    },
  ] as const;
  const groupedLeads = leadBuckets
    .map((bucket) => ({
      ...bucket,
      items: leads.filter((lead) => lead.follow_up_bucket === bucket.key),
    }))
    .filter((bucket) => bucket.items.length > 0);

  function getLeadCommercialSignal(lead: Lead) {
    const followUpAt = lead.follow_up_at ?? "";
    const isOverdue = Boolean(followUpAt) && followUpAt < todayIso;
    const isDueToday = followUpAt === todayIso;
    if (lead.converted_contact_id) {
      return { tone: "success" as const, label: "Convertido em contato" };
    }
    if (isOverdue) {
      return { tone: "danger" as const, label: "SLA estourado" };
    }
    if (isDueToday) {
      return { tone: "warning" as const, label: "Follow-up hoje" };
    }
    if (["qualified", "follow_up", "proposal"].includes(lead.stage)) {
      return { tone: "info" as const, label: "Lead quente" };
    }
    return { tone: "neutral" as const, label: "Pendente de triagem" };
  }

  function getLeadPriorityMeta(lead: Lead) {
    switch (lead.priority_label) {
      case "critical":
        return { tone: "danger" as const, label: "Prioridade critica" };
      case "high":
        return { tone: "warning" as const, label: "Alta prioridade" };
      case "normal":
        return { tone: "info" as const, label: "Ritmo normal" };
      default:
        return { tone: "neutral" as const, label: "Baixa pressao" };
    }
  }

  function getLeadBucketSummary(lead: Lead) {
    switch (lead.follow_up_bucket) {
      case "overdue":
        return "Follow-up fora da janela ideal. Reagir agora reduz perda de calor.";
      case "today":
        return "Janela ativa hoje. O proximo passo precisa sair nesta rodada.";
      case "this_week":
        return "Cadencia montada para esta semana, com margem de controle.";
      case "later":
        return "Seguimento programado para uma janela futura do ciclo comercial.";
      case "converted":
        return "Lead ja incorporado ao CRM como contato ativo.";
      default:
        return "Sem data marcada. Definir dono e proximo passo evita esfriamento.";
    }
  }

  useEffect(() => {
    void loadLeads().catch((loadError) =>
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar leads."),
    );
  }, [loadLeads]);

  useEffect(() => {
    if (!tokens?.access_token) return;
    void api
      .listMemberships(tokens.access_token)
      .then(setMemberships)
      .catch(() => undefined);
  }, [tokens]);

  async function handleLeadUpdate(
    leadId: string,
    updates: { stage?: string; owner_user_id?: string; follow_up_at?: string },
  ) {
    if (!tokens?.access_token) return;
    setPendingLeadId(leadId);
    setLeadMessage(null);
    setError(null);
    try {
      const updatedLead = await api.updateLead(tokens.access_token, leadId, updates);
      setLeads((currentLeads) =>
        currentLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)),
      );
      setLeadMessage("Lead atualizado no funil comercial.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Falha ao atualizar lead.");
    } finally {
      setPendingLeadId(null);
    }
  }

  async function handleLeadConvert(leadId: string) {
    if (!tokens?.access_token) return;
    setPendingLeadId(leadId);
    setLeadMessage(null);
    setError(null);
    try {
      const convertedLead = await api.convertLead(tokens.access_token, leadId);
      setLeads((currentLeads) =>
        currentLeads.map((lead) => (lead.id === convertedLead.id ? convertedLead : lead)),
      );
      setLeadMessage("Lead convertido para contato com sucesso.");
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Falha ao converter lead.");
    } finally {
      setPendingLeadId(null);
    }
  }

  return (
    <section className="app-section leads-layout">
      <div className="panel leads-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Entrada comercial</p>
            <h2>Leads captados</h2>
          </div>
          <span>{leads.length}</span>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        {leadMessage ? <div className="info-box">{leadMessage}</div> : null}
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Total captado</strong>
            <span>{leads.length}</span>
          </article>
          <article className="summary-tile">
            <strong>Ultimos 7 dias</strong>
            <span>{recentLeads}</span>
          </article>
          <article className="summary-tile">
            <strong>Com WhatsApp</strong>
            <span>{leadsWithPhone}</span>
          </article>
          <article className="summary-tile">
            <strong>Com cidade</strong>
            <span>{leadsWithCity}</span>
          </article>
          <article className="summary-tile">
            <strong>Ja convertidos</strong>
            <span>{convertedLeads}</span>
          </article>
          <article className="summary-tile">
            <strong>Follow-up agendado</strong>
            <span>{followUpsPlanned}</span>
          </article>
          <article className="summary-tile">
            <strong>Follow-up atrasado</strong>
            <span>{overdueFollowUps}</span>
          </article>
          <article className="summary-tile">
            <strong>Leads quentes</strong>
            <span>{hotLeads}</span>
          </article>
          <article className="summary-tile">
            <strong>Fila critica</strong>
            <span>{criticalQueue}</span>
          </article>
        </div>
        <div className="leads-intro">
          <p className="meta-copy">
            Este painel mostra a qualidade da entrada comercial e agora permite transformar
            interesse validado em contato acionavel sem sair do fluxo.
          </p>
          <p className="meta-copy">
            {overdueFollowUps
              ? `${overdueFollowUps} follow-up(s) estao fora do SLA e ${dueTodayFollowUps} vencem hoje.`
              : "Sem follow-up atrasado agora. Mantenha a cadencia antes da janela esfriar."}
          </p>
          <p className="meta-copy">
            {criticalQueue
              ? `${criticalQueue} lead(s) estao com prioridade alta ou critica e devem puxar a cadencia comercial.`
              : "A fila critica esta controlada. Use as sugestoes de owner para manter distribuicao clara."}
          </p>
        </div>
        <div className="toolbar lead-toolbar">
          <input
            placeholder="Buscar por nome, email, cidade ou desafio"
            value={leadQuery}
            onChange={(event) => setLeadQuery(event.target.value)}
          />
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
            <option value="">Todos os estagios</option>
            <option value="captured">Captado</option>
            <option value="qualified">Qualificado</option>
            <option value="follow_up">Em follow-up</option>
            <option value="proposal">Proposta</option>
            <option value="converted">Convertido</option>
            <option value="archived">Arquivado</option>
          </select>
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="">Todos os responsaveis</option>
            {memberships.map((member) => (
              <option key={member.id} value={member.user_id}>
                {member.full_name}
              </option>
            ))}
          </select>
          <Button
            label="Limpar funil"
            variant="secondary"
            onClick={() => {
              setLeadQuery("");
              setStageFilter("");
              setOwnerFilter("");
            }}
          />
        </div>
        <div className="lead-records">
          {leads.length === 0 ? <p className="meta-copy">Nenhum lead captado ainda.</p> : null}
          {groupedLeads.map((bucket) => (
            <section className="lead-bucket" key={bucket.key}>
              <div className="lead-bucket__header">
                <div>
                  <p className="eyebrow">{bucket.eyebrow}</p>
                  <h3>{bucket.title}</h3>
                </div>
                <span>{bucket.items.length}</span>
              </div>
              <p className="meta-copy">{bucket.description}</p>
              <div className="list-grid lead-bucket__grid">
                {bucket.items.map((lead) => {
                  const commercialSignal = getLeadCommercialSignal(lead);
                  const priorityMeta = getLeadPriorityMeta(lead);
                  return (
                    <article className="list-card lead-card" key={lead.id}>
                      <div className="section-header">
                        <strong>{lead.name}</strong>
                        <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <span>{lead.email}</span>
                      <div className="lead-card__meta">
                        <span>{lead.phone || "Sem WhatsApp"}</span>
                        <span>{lead.city || "Cidade nao informada"}</span>
                        <span>{lead.role || "Papel nao informado"}</span>
                      </div>
                      <div className="lead-card__status">
                        <div className="lead-card__status-badges">
                          <Badge tone={commercialSignal.tone}>{commercialSignal.label}</Badge>
                          <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>
                        </div>
                        <span className="meta-copy">Origem: {lead.source || "website"}</span>
                      </div>
                      <div className="lead-card__priority">
                        <div className="lead-card__priority-copy">
                          <strong>Escore de risco: {lead.risk_score}</strong>
                          <span className="meta-copy">{getLeadBucketSummary(lead)}</span>
                        </div>
                        <span className="meta-copy">
                          {lead.owner_name
                            ? `Dono: ${lead.owner_name}`
                            : lead.suggested_owner_name
                              ? `Sugestao de dono: ${lead.suggested_owner_name}`
                              : "Sem sugestao automatica disponivel"}
                        </span>
                      </div>
                      <div className="lead-card__funnel">
                        <label>
                          <span className="meta-copy">Estagio</span>
                          <select
                            value={lead.stage}
                            onChange={(event) =>
                              void handleLeadUpdate(lead.id, {
                                stage: event.target.value,
                              })
                            }
                            disabled={pendingLeadId === lead.id}
                          >
                            <option value="captured">Captado</option>
                            <option value="qualified">Qualificado</option>
                            <option value="follow_up">Em follow-up</option>
                            <option value="proposal">Proposta</option>
                            <option value="converted">Convertido</option>
                            <option value="archived">Arquivado</option>
                          </select>
                        </label>
                        <label>
                          <span className="meta-copy">Responsavel</span>
                          <select
                            value={lead.owner_user_id || ""}
                            onChange={(event) =>
                              void handleLeadUpdate(lead.id, {
                                owner_user_id: event.target.value,
                              })
                            }
                            disabled={pendingLeadId === lead.id}
                          >
                            <option value="">Sem dono</option>
                            {memberships.map((member) => (
                              <option key={member.id} value={member.user_id}>
                                {member.full_name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span className="meta-copy">Proximo follow-up</span>
                          <input
                            type="date"
                            value={lead.follow_up_at || ""}
                            onChange={(event) =>
                              void handleLeadUpdate(lead.id, {
                                follow_up_at: event.target.value,
                              })
                            }
                            disabled={pendingLeadId === lead.id}
                          />
                        </label>
                      </div>
                      {!lead.owner_user_id && lead.suggested_owner_user_id ? (
                        <div className="lead-card__suggestion">
                          <div>
                            <strong>Atribuicao sugerida</strong>
                            <p className="meta-copy">
                              Encaminhe este lead para{" "}
                              {lead.suggested_owner_name || "o owner sugerido"} e reduza tempo
                              parado na triagem.
                            </p>
                          </div>
                          <Button
                            label={
                              pendingLeadId === lead.id ? "Atribuindo..." : "Atribuir sugestao"
                            }
                            variant="secondary"
                            onClick={() =>
                              void handleLeadUpdate(lead.id, {
                                owner_user_id: lead.suggested_owner_user_id || "",
                              })
                            }
                            disabled={pendingLeadId === lead.id}
                          />
                        </div>
                      ) : null}
                      <p>{lead.challenge || "Sem desafio informado no primeiro contato."}</p>
                      <div className="lead-card__actions">
                        <span className="meta-copy">
                          {lead.follow_up_at
                            ? `Follow-up em ${new Date(lead.follow_up_at).toLocaleDateString("pt-BR")}`
                            : "Sem proximo passo definido"}
                        </span>
                        {lead.converted_contact_id ? (
                          <span className="meta-copy">
                            Convertido em{" "}
                            {new Date(lead.converted_at || lead.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        ) : (
                          <Button
                            label={
                              pendingLeadId === lead.id
                                ? "Convertendo..."
                                : "Converter para contato"
                            }
                            variant="secondary"
                            onClick={() => void handleLeadConvert(lead.id)}
                            disabled={pendingLeadId === lead.id}
                          />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpponentsPage() {
  const { tokens } = useAuth();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [summary, setSummary] = useState<OpponentSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<OpponentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [stanceFilter, setStanceFilter] = useState("");
  const [watchLevelFilter, setWatchLevelFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const loadOpponents = useCallback(async () => {
    if (!tokens?.access_token) return;
    try {
      const response = await api.listOpponents(tokens.access_token, {
        query: search || undefined,
        tag: tagFilter || undefined,
        stance: stanceFilter || undefined,
        watch_level: watchLevelFilter || undefined,
      });
      const summaryPayload = await api.getOpponentsSummary(tokens.access_token);
      setOpponents(response);
      setSummary(summaryPayload);
      if (!selectedId && response[0]) {
        setSelectedId(response[0].id);
      } else if (selectedId && !response.find((item) => item.id === selectedId)) {
        setSelectedId(response[0]?.id ?? null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar adversarios.");
    }
  }, [search, selectedId, stanceFilter, tagFilter, tokens, watchLevelFilter]);

  const loadEvents = useCallback(
    async (opponentId: string) => {
      if (!tokens?.access_token) return;
      try {
        setEvents(
          await api.listOpponentEvents(tokens.access_token, opponentId, {
            severity: severityFilter || undefined,
          }),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Falha ao carregar eventos.");
      }
    },
    [severityFilter, tokens],
  );

  useEffect(() => {
    void loadOpponents();
  }, [loadOpponents]);

  useEffect(() => {
    if (!selectedId) return;
    void loadEvents(selectedId);
  }, [loadEvents, selectedId]);

  async function handleCreateOpponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createOpponent(tokens.access_token, {
        name: String(formData.get("name") ?? ""),
        context: String(formData.get("context") ?? ""),
        stance: String(formData.get("stance") ?? "challenger"),
        watch_level: String(formData.get("watch_level") ?? "attention"),
        links: String(formData.get("links") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: String(formData.get("notes") ?? "") || null,
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      form.reset();
      await loadOpponents();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao criar adversario.");
    }
  }

  async function handleDelete(opponentId: string) {
    if (!tokens?.access_token) return;
    try {
      await api.deleteOpponent(tokens.access_token, opponentId);
      setEvents([]);
      setSelectedId(null);
      await loadOpponents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao remover adversario.");
    }
  }

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokens?.access_token || !selectedId) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api.createOpponentEvent(tokens.access_token, selectedId, {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        event_date: String(formData.get("event_date") ?? ""),
        severity: String(formData.get("severity") ?? "info"),
      });
      form.reset();
      await loadEvents(selectedId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao criar evento.");
    }
  }

  const selectedOpponent = opponents.find((item) => item.id === selectedId) ?? null;
  const criticalEvents = events.filter((item) => item.severity === "critical").length;
  const recentEvents = events.filter((item) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    return new Date(item.event_date) >= threshold;
  }).length;
  const lastEventDate = events[0]?.event_date ?? null;
  const comparison = {
    critical:
      summary?.critical_watch_count ??
      opponents.filter((item) => item.watch_level === "critical").length,
    incumbent:
      summary?.stance_distribution?.incumbent ??
      opponents.filter((item) => item.stance === "incumbent").length,
    challenger:
      summary?.stance_distribution?.challenger ??
      opponents.filter((item) => item.stance === "challenger").length,
  };
  const momentumLabel =
    summary?.momentum_direction === "up"
      ? "Pressao em alta"
      : summary?.momentum_direction === "down"
        ? "Pressao em queda"
        : "Pressao estavel";

  return (
    <section className="app-section split-layout wide-layout opponents-layout">
      <form className="panel form-panel entity-form" onSubmit={handleCreateOpponent}>
        <div className="section-heading">
          <p className="eyebrow">Radar politico</p>
          <h2>Novo adversario</h2>
        </div>
        <label>
          Nome
          <input name="name" required minLength={2} />
        </label>
        <label>
          Contexto
          <input name="context" required minLength={2} />
        </label>
        <label>
          Classificacao
          <select name="stance" defaultValue="challenger">
            <option value="challenger">Desafiante</option>
            <option value="incumbent">Incumbente</option>
            <option value="ally_risk">Risco aliado</option>
            <option value="local_force">Forca local</option>
          </select>
        </label>
        <label>
          Nivel de monitoramento
          <select name="watch_level" defaultValue="attention">
            <option value="observe">Observar</option>
            <option value="attention">Atencao</option>
            <option value="critical">Critico</option>
          </select>
        </label>
        <label>
          Links
          <input name="links" placeholder="https://perfil1, https://perfil2" />
        </label>
        <label>
          Tags
          <input name="tags" placeholder="prefeitura, digital, forte" />
        </label>
        <label>
          Observacoes
          <textarea name="notes" rows={4} />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <Button type="submit" label="Salvar adversario" />
      </form>

      <div className="panel opponents-stage">
        <div className="section-header">
          <div>
            <p className="eyebrow">Mapa competitivo</p>
            <h2>Adversarios</h2>
          </div>
          <span>{opponents.length} registros</span>
        </div>
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Monitoramento critico</strong>
            <span>{comparison.critical}</span>
          </article>
          <article className="summary-tile">
            <strong>Incumbentes</strong>
            <span>{comparison.incumbent}</span>
          </article>
          <article className="summary-tile">
            <strong>Desafiantes</strong>
            <span>{comparison.challenger}</span>
          </article>
          <article className="summary-tile">
            <strong>Eventos criticos</strong>
            <span>{summary?.critical_events_count ?? 0}</span>
          </article>
          <article className="summary-tile">
            <strong>Ultimos 30 dias</strong>
            <span>{summary?.recent_events_count ?? 0}</span>
          </article>
          <article className="summary-tile">
            <strong>Janela anterior</strong>
            <span>{summary?.previous_window_events_count ?? 0}</span>
          </article>
          <article className="summary-tile">
            <strong>Ritmo competitivo</strong>
            <span>
              {momentumLabel} ({summary?.momentum_delta ?? 0})
            </span>
          </article>
        </div>
        <div className="opponent-spotlight panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Spotlight temporal</p>
              <h2>{summary?.spotlight.name ?? "Radar competitivo"}</h2>
            </div>
            <Badge
              tone={
                summary?.spotlight.momentum_direction === "up"
                  ? "warning"
                  : summary?.spotlight.momentum_direction === "down"
                    ? "success"
                    : "info"
              }
            >
              {summary?.spotlight.momentum_direction ?? "stable"}
            </Badge>
          </div>
          <p className="meta-copy">
            {summary?.spotlight.summary ??
              "A leitura comparativa aparece quando a timeline ganha volume historico."}
          </p>
          <div className="list-grid summary-grid">
            <article className="summary-tile">
              <strong>Delta recente</strong>
              <span>{summary?.spotlight.momentum_delta ?? 0}</span>
            </article>
            <article className="summary-tile">
              <strong>Eventos recentes</strong>
              <span>{summary?.spotlight.recent_events ?? 0}</span>
            </article>
            <article className="summary-tile">
              <strong>Eventos criticos</strong>
              <span>{summary?.spotlight.critical_events ?? 0}</span>
            </article>
            <article className="summary-tile">
              <strong>Ultimo sinal</strong>
              <span>
                {summary?.spotlight.last_event_date
                  ? new Date(summary.spotlight.last_event_date).toLocaleDateString("pt-BR")
                  : "Sem evento recente"}
              </span>
            </article>
          </div>
        </div>
        <div className="toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, contexto ou observacoes"
          />
          <input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="Filtrar por tag"
          />
          <select value={stanceFilter} onChange={(event) => setStanceFilter(event.target.value)}>
            <option value="">Todas as classificacoes</option>
            <option value="challenger">Desafiante</option>
            <option value="incumbent">Incumbente</option>
            <option value="ally_risk">Risco aliado</option>
            <option value="local_force">Forca local</option>
          </select>
          <select
            value={watchLevelFilter}
            onChange={(event) => setWatchLevelFilter(event.target.value)}
          >
            <option value="">Todos os niveis</option>
            <option value="observe">Observar</option>
            <option value="attention">Atencao</option>
            <option value="critical">Critico</option>
          </select>
        </div>
        <div className="list-grid opponent-records">
          {opponents.map((opponent) => (
            <article
              className={`list-card opponent-card ${selectedId === opponent.id ? "list-card--selected" : ""}`}
              key={opponent.id}
            >
              <button
                className="card-link"
                type="button"
                onClick={() => setSelectedId(opponent.id)}
              >
                <strong>{opponent.name}</strong>
                <span>{opponent.context}</span>
                <span>
                  {opponent.stance} - {opponent.watch_level}
                </span>
                <span>{opponent.tags.join(", ") || "Sem tags"}</span>
              </button>
              <button
                className="inline-button"
                type="button"
                onClick={() => handleDelete(opponent.id)}
              >
                Remover
              </button>
            </article>
          ))}
        </div>
        <div className="section-header">
          <h2>Watchlist comparativa</h2>
        </div>
        <div className="list-grid watchlist-records">
          {(summary?.top_watchlist ?? []).length === 0 ? (
            <p className="meta-copy">
              A watchlist comparativa aparece assim que houver monitorados com eventos.
            </p>
          ) : null}
          {(summary?.top_watchlist ?? []).map((item) => (
            <article className="list-card watchlist-card" key={item.opponent_id}>
              <strong>{item.name}</strong>
              <span>
                {item.stance} - {item.watch_level}
              </span>
              <span>{item.total_events} evento(s) no total</span>
              <span>
                {item.critical_events} critico(s) - {item.recent_events} recentes
              </span>
              <span>
                Janela anterior {item.previous_window_events} - delta {item.momentum_delta}
              </span>
              <Badge
                tone={
                  item.momentum_direction === "up"
                    ? "warning"
                    : item.momentum_direction === "down"
                      ? "success"
                      : "info"
                }
              >
                {item.momentum_direction}
              </Badge>
              <span>
                {item.last_event_date
                  ? new Date(item.last_event_date).toLocaleDateString("pt-BR")
                  : "Sem eventos"}
              </span>
            </article>
          ))}
        </div>
      </div>

      <div className="panel timeline-stage">
        <div className="section-header">
          <h2>Timeline</h2>
          <span>{events.length} eventos</span>
        </div>
        <div className="list-grid onboarding-guidance-grid summary-grid">
          <article className="summary-tile">
            <strong>Selecionado</strong>
            <span>{selectedOpponent?.name ?? "Nenhum adversario selecionado"}</span>
          </article>
          <article className="summary-tile">
            <strong>Eventos criticos</strong>
            <span>{criticalEvents}</span>
          </article>
          <article className="summary-tile">
            <strong>Eventos recentes</strong>
            <span>{recentEvents}</span>
          </article>
          <article className="summary-tile">
            <strong>Contexto</strong>
            <span>
              {selectedOpponent?.context ?? "Selecione um adversario para detalhar a timeline"}
            </span>
          </article>
          <article className="summary-tile">
            <strong>Classificacao</strong>
            <span>
              {selectedOpponent
                ? `${selectedOpponent.stance} - ${selectedOpponent.watch_level}`
                : "Sem selecao"}
            </span>
          </article>
          <article className="summary-tile">
            <strong>Ultimo sinal</strong>
            <span>
              {lastEventDate ? new Date(lastEventDate).toLocaleDateString("pt-BR") : "Sem eventos"}
            </span>
          </article>
        </div>
        <div className="toolbar">
          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
          >
            <option value="">Todas as severidades</option>
            <option value="info">Info</option>
            <option value="warning">Aviso</option>
            <option value="critical">Critico</option>
          </select>
        </div>
        <form className="form-panel compact-form" onSubmit={handleCreateEvent}>
          <label>
            Titulo
            <input name="title" required minLength={2} />
          </label>
          <label>
            Data
            <input name="event_date" type="date" required />
          </label>
          <label>
            Severidade
            <select name="severity" defaultValue="info">
              <option value="info">Info</option>
              <option value="warning">Aviso</option>
              <option value="critical">Critico</option>
            </select>
          </label>
          <label>
            Descricao
            <textarea name="description" rows={3} required />
          </label>
          <Button type="submit" label="Adicionar evento" />
        </form>
        <div className="list-grid timeline-records">
          {events.length === 0 ? (
            <p className="meta-copy">Nenhum evento registrado para o filtro atual.</p>
          ) : null}
          {events.map((item) => (
            <article className="list-card timeline-record" key={item.id}>
              <div className="section-header">
                <strong>{item.title}</strong>
                <Badge
                  tone={
                    item.severity === "critical"
                      ? "warning"
                      : item.severity === "warning"
                        ? "info"
                        : "neutral"
                  }
                >
                  {item.severity}
                </Badge>
              </div>
              <span>{new Date(item.event_date).toLocaleDateString("pt-BR")}</span>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppShell() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigationItems = [
    { to: "/app", label: "Dashboard" },
    { to: "/app/onboarding", label: "Onboarding" },
    { to: "/app/team", label: "Equipe" },
    { to: "/app/contacts", label: "Contatos" },
    { to: "/app/tasks", label: "Tarefas" },
    { to: "/app/opponents", label: "Adversarios" },
    { to: "/app/reports", label: "Relatorios" },
    { to: "/app/billing", label: "Assinatura" },
    { to: "/app/leads", label: "Leads" },
    { to: "/app/audit", label: "Auditoria" },
  ] as const;
  const pageMeta: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
    "/app": {
      eyebrow: "Painel executivo",
      title: "Operacao em andamento",
      subtitle: "Leitura central do workspace com prioridade, sinais e foco da coordenacao.",
    },
    "/app/onboarding": {
      eyebrow: "Ativacao do workspace",
      title: "Onboarding guiado",
      subtitle: "Primeiros passos para tirar a operacao do zero sem perder contexto.",
    },
    "/app/team": {
      eyebrow: "Governanca interna",
      title: "Equipe e papeis",
      subtitle: "Estruture identidade, responsabilidades e expansao do time com controle claro.",
    },
    "/app/contacts": {
      eyebrow: "Base politica",
      title: "Contatos e historico",
      subtitle: "Relacao viva com liderancas, imprensa e frentes locais em um fluxo unico.",
    },
    "/app/tasks": {
      eyebrow: "Ritmo operacional",
      title: "Execucao e prioridades",
      subtitle: "Board, urgencia e responsaveis para manter a entrega sob comando.",
    },
    "/app/opponents": {
      eyebrow: "Monitoramento politico",
      title: "Adversarios e timeline",
      subtitle: "Watchlist, eventos e leitura comparativa para antecipar movimento.",
    },
    "/app/reports": {
      eyebrow: "Leitura consolidada",
      title: "Relatorios e exportacao",
      subtitle: "Transforme operacao em material executivo, comparativo e exportavel.",
    },
    "/app/billing": {
      eyebrow: "Leitura comercial",
      title: "Assinatura e planos",
      subtitle: "Status comercial, trial, pendencias e historico em uma visao unica.",
    },
    "/app/leads": {
      eyebrow: "Entrada comercial",
      title: "Leads e demanda",
      subtitle: "Capte, qualifique e leia a demanda inicial antes da conversa comercial.",
    },
    "/app/audit": {
      eyebrow: "Governanca e rastreabilidade",
      title: "Auditoria operacional",
      subtitle: "Cada movimento relevante do workspace reunido em uma trilha clara.",
    },
  };
  const currentMeta = pageMeta[location.pathname] ?? pageMeta["/app"];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand">Pulso</div>
          <span>workspace politico</span>
        </div>
        <nav>
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Estrutura viva</strong>
          <span>CRM, monitoramento, execucao e governanca numa narrativa unica.</span>
        </div>
      </aside>
      <section className="app-content">
        <div className="topbar topbar-actions">
          <div>
            <p className="eyebrow">{currentMeta.eyebrow}</p>
            <h1 className="topbar-title">{currentMeta.title}</h1>
            <p className="meta-copy topbar-subtitle">{currentMeta.subtitle}</p>
          </div>
          <Button label="Sair" variant="secondary" onClick={logout} />
        </div>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="opponents" element={<OpponentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Routes>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <header className="site-header">
        <div className="site-header__brand">
          <Link to="/" className="brand-link">
            Pulso Politico
          </Link>
          <span className="site-header__tag">estrategia, governanca e execucao politica</span>
        </div>
        <nav className="site-nav">
          <Link to="/">Landing</Link>
          <Link to="/plans">Planos</Link>
          <Link to="/contact">Contato</Link>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Criar conta</Link>
          <Link to="/app">App</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
      <footer className="site-footer">
        <Link to="/privacy">Privacidade</Link>
        <Link to="/terms">Termos</Link>
      </footer>
    </AuthProvider>
  );
}
