import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Badge, Button, Card, Input, Table } from "@pulso/ui";
import { AuthPage } from "./AuthPage";
import {
  api,
  BillingEvent,
  Campaign,
  Contact,
  DashboardSummary,
  Lead,
  Membership,
  OnboardingState,
  Opponent,
  OpponentEvent,
  OpponentSummary,
  Report,
  BillingPlan,
  Subscription,
  Task,
  AiSummary,
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
            <p>Tenant proprio, memberships e roles para separar dados, acessos e responsabilidade.</p>
          </Card>
          <Card title="Execucao visivel">
            <p>Kanban, tarefas recentes, alertas e dashboard para leitura rapida do dia.</p>
          </Card>
          <Card title="Memoria institucional">
            <p>Relatorios, auditoria e acompanhamento de adversarios para sustentar decisao e continuidade.</p>
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
            <Button type="submit" label={leadPending ? "Enviando..." : "Enviar lead"} disabled={leadPending} />
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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [aiModule, setAiModule] = useState("dashboard");

  useEffect(() => {
    if (!tokens?.access_token) {
      return;
    }

    void Promise.all([api.dashboardSummary(tokens.access_token), api.getAiSummary(tokens.access_token, aiModule)]).then(
      ([dashboardPayload, aiPayload]) => {
        setSummary(dashboardPayload);
        setAiSummary(aiPayload);
      },
    );
  }, [tokens, aiModule]);

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
            <p className="meta-copy">{summary?.next_action ?? "Carregando recomendacao operacional..."}</p>
          </div>
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
          <span>Tarefas em aberto</span>
          <strong>{summary?.open_tasks_count ?? 0}</strong>
          <p>Frente operacional em execucao.</p>
        </article>
        <article className="metric-tile">
          <span>Tarefas vencidas</span>
          <strong>{summary?.overdue_tasks_count ?? 0}</strong>
          <p>{summary?.overdue_tasks_count ? "Ha pontos atrasados exigindo resposta." : "Sem atraso critico agora."}</p>
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
            </select>
          </div>
          <p className="dashboard-ai-summary">{aiSummary?.summary ?? "Carregando recomendacoes..."}</p>
          <div className="dashboard-ai-callout">
            <strong>{aiSummary?.next_action ?? "Definindo proxima acao..."}</strong>
            <p>{aiSummary?.action_reason ?? "Lendo o contexto operacional do workspace."}</p>
            <span>Urgencia {aiSummary?.urgency ?? "normal"}</span>
          </div>
          {aiSummary?.recommendations?.length ? (
            <div className="dashboard-recommendations dashboard-recommendations--grid">
              {aiSummary.recommendations.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </section>
        <section className="panel dashboard-snapshot">
          <div className="section-heading">
            <p className="eyebrow">Panorama executivo</p>
            <h2>Onde a energia deve entrar</h2>
          </div>
          <div className="snapshot-list">
            <article>
              <span>Base politica</span>
              <strong>{summary?.contacts_count ?? 0} contato(s) sustentam a operacao atual.</strong>
            </article>
            <article>
              <span>Coordenacao</span>
              <strong>{summary?.open_tasks_count ?? 0} frente(s) abertas pedem acompanhamento de rotina.</strong>
            </article>
            <article>
              <span>Monitoramento</span>
              <strong>{summary?.opponents_count ?? 0} adversario(s) seguem no radar do workspace.</strong>
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

  async function loadMembers() {
    if (!tokens?.access_token) return;
    const [membershipList, tenant] = await Promise.all([
      api.listMemberships(tokens.access_token),
      api.currentTenant(tokens.access_token),
    ]);
    setMembers(membershipList);
    setTenantName(tenant.tenant.name);
  }

  useEffect(() => {
    void loadMembers();
  }, [tokens]);

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
    <section className="app-section split-layout wide-layout">
      <form className="panel form-panel" onSubmit={handleTenantUpdate}>
        <h2>Identidade do workspace</h2>
        <label>
          Nome do workspace
          <input name="tenant_name" defaultValue={tenantName} required minLength={3} />
        </label>
        {message ? <div className="info-box">{message}</div> : null}
        <Button type="submit" label="Atualizar identidade" />
      </form>

      <form className="panel form-panel" onSubmit={handleInvite}>
        <h2>Convidar membro</h2>
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
        <Button type="submit" label="Enviar convite" />
      </form>

      <div className="panel">
        <div className="section-header">
          <h2>Equipe</h2>
          <span>{members.length}</span>
        </div>
        <Table
          rows={members}
          columns={[
            {
              key: "full_name",
              header: "Nome",
              render: (member) => member.full_name,
            },
            {
              key: "email",
              header: "Email",
              render: (member) => member.email,
            },
            {
              key: "role",
              header: "Role",
              render: (member) => (
                <Badge tone={member.role === "owner" ? "info" : "neutral"}>{roleLabels[member.role]}</Badge>
              ),
            },
            {
              key: "actions",
              header: "Acoes",
              render: (member) =>
                member.role === "owner" ? (
                  "Responsavel principal"
                ) : (
                  <div className="inline-actions">
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
                    <button
                      className="inline-button"
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remover
                    </button>
                  </div>
                ),
            },
          ]}
        />
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

  async function loadData() {
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
  }

  useEffect(() => {
    void loadData();
  }, [tokens]);

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
      detail: state?.campaign_id ? `${campaigns.length} campanha(s) cadastrada(s)` : "Crie a primeira campanha",
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
      detail: opponents.length ? `${opponents.length} adversario(s) mapeado(s)` : "Registre um primeiro monitorado",
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
                <Badge tone={item.done ? "success" : "neutral"}>{item.done ? "feito" : "pendente"}</Badge>
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
            <input value={objective} onChange={(event) => setObjective(event.target.value)} required minLength={3} />
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
            <span>{campaigns[0] ? `${campaigns[0].name} · ${campaigns[0].office}` : "Nenhuma campanha criada"}</span>
          </article>
          <article className="list-card">
            <strong>Equipe</strong>
            <span>{memberships.length} membro(s)</span>
            <span>
              {memberships.length > 1 ? memberships.slice(1).map((member) => member.full_name).join(", ") : "Somente owner"}
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

  async function loadContacts() {
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
  }

  useEffect(() => {
    void loadContacts();
  }, [tokens, search, kindFilter, statusFilter, tagFilter, cityFilter]);

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
      setError(updateError instanceof Error ? updateError.message : "Falha ao atualizar status do contato.");
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
    <section className="app-section split-layout">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Novo contato</h2>
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

      <div className="panel">
        <div className="section-header">
          <h2>Contatos</h2>
          <span>{contacts.length} registros</span>
        </div>
        <div className="list-grid contact-status-grid">
          {Object.entries(groupedByStatus).map(([status, count]) => (
            <article className="list-card" key={status}>
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
          <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} placeholder="Filtrar por tag" />
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
        <div className="list-grid">
          {contacts.length === 0 ? <p className="meta-copy">Nenhum contato cadastrado.</p> : null}
          {contacts.map((contact) => (
            <article className="list-card" key={contact.id}>
              <div className="section-header">
                <div className="contact-heading">
                  <strong>{contact.name}</strong>
                  <span className="meta-copy">
                    Atualizado em {new Date(contact.updated_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="contact-badges">
                  <Badge tone="neutral">{contact.kind}</Badge>
                  <Badge tone={contact.status === "priority" ? "warning" : contact.status === "qualified" ? "success" : "info"}>
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
                    onChange={(event) => handleStatusChange(contact.id, event.target.value as Contact["status"])}
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
              <button className="inline-button" type="button" onClick={() => handleDelete(contact.id)}>
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

  async function loadTasks() {
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
  }

  useEffect(() => {
    void loadTasks();
  }, [tokens, search, statusFilter, priorityFilter]);

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
    <section className="app-section split-layout">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Nova tarefa</h2>
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
        <Button type="submit" label="Salvar tarefa" />
      </form>

      <div className="panel">
        <div className="section-header">
          <h2>Tarefas</h2>
          <span>{tasks.length} registros</span>
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
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="">Todas prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div className="kanban-grid">
          {["backlog", "in_progress", "waiting_review", "done"].map((status) => (
            <div key={status} className="kanban-column">
              <h3>{status}</h3>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <article className="list-card" key={task.id}>
                    <strong>{task.title}</strong>
                    <span>{task.priority}</span>
                    <span>{task.assignee_name || "Sem responsavel"}</span>
                    <button className="inline-button" type="button" onClick={() => moveTask(task.id, task.status)}>
                      Avancar
                    </button>
                    <button className="inline-button" type="button" onClick={() => handleDelete(task.id)}>
                      Remover
                    </button>
                  </article>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuditPage() {
  const { tokens } = useAuth();
  const [logs, setLogs] = useState<Array<{ id: string; action: string; resource_type: string; created_at: string }>>([]);
  const [error, setError] = useState<string | null>(null);

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
    <section className="app-section">
      <div className="panel">
        <div className="section-header">
          <h2>Auditoria</h2>
          <span>{logs.length} eventos</span>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="list-grid">
          {logs.map((log) => (
            <article className="list-card" key={log.id}>
              <strong>{log.action}</strong>
              <span>{log.resource_type}</span>
              <span>{new Date(log.created_at).toLocaleString("pt-BR")}</span>
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

  async function loadReports() {
    if (!tokens?.access_token) return;
    setReports(await api.listReports(tokens.access_token, { report_type: reportTypeFilter || undefined }));
  }

  useEffect(() => {
    void loadReports();
  }, [tokens, reportTypeFilter]);

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
    <section className="app-section split-layout">
      <form className="panel form-panel" onSubmit={handleCreateReport}>
        <h2>Novo relatorio</h2>
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

      <div className="panel">
        <div className="section-header">
          <h2>Relatorios</h2>
          <span>{reports.length}</span>
        </div>
        <div className="list-grid onboarding-guidance-grid">
          <article className="list-card onboarding-guidance">
            <strong>Tarefas abertas</strong>
            <span>{totals.openTasks}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Contatos prioritarios</strong>
            <span>{totals.priorityContacts}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Tarefas vencidas</strong>
            <span>{totals.overdueTasks}</span>
          </article>
        </div>
        <div className="toolbar">
          <select value={reportTypeFilter} onChange={(event) => setReportTypeFilter(event.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="operational">Operacional</option>
            <option value="executive">Executivo</option>
            <option value="comparative">Comparativo</option>
            <option value="opponents">Adversarios</option>
            <option value="ai_summary">Resumo IA</option>
          </select>
        </div>
        <div className="list-grid">
          {reports.map((report) => (
            <article className="list-card" key={report.id}>
              <div className="section-header">
                <strong>{report.title}</strong>
                <Badge tone="neutral">{report.report_type}</Badge>
              </div>
              <p>{report.summary}</p>
              <div className="list-grid onboarding-guidance-grid">
                <article className="list-card">
                  <strong>Contatos</strong>
                  <span>{report.metrics.contacts_count}</span>
                </article>
                <article className="list-card">
                  <strong>Prioritarios</strong>
                  <span>{report.metrics.priority_contacts_count}</span>
                </article>
                <article className="list-card">
                  <strong>Tarefas abertas</strong>
                  <span>{report.metrics.open_tasks_count}</span>
                </article>
                <article className="list-card">
                  <strong>Vencidas</strong>
                  <span>{report.metrics.overdue_tasks_count}</span>
                </article>
              </div>
              <div className="inline-actions">
                <button className="inline-button" type="button" onClick={() => handleExport(report.id, "pdf")}>
                  Exportar PDF
                </button>
                <button className="inline-button" type="button" onClick={() => handleExport(report.id, "csv")}>
                  Exportar CSV
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
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

  async function loadSubscription() {
    if (!tokens?.access_token) return;
    const [subscriptionPayload, plansPayload, eventsPayload] = await Promise.all([
      api.getSubscription(tokens.access_token),
      api.listPlans(tokens.access_token),
      api.listBillingEvents(tokens.access_token),
    ]);
    setSubscription(subscriptionPayload);
    setPlans(plansPayload);
    setEvents(eventsPayload);
  }

  useEffect(() => {
    void loadSubscription();
  }, [tokens]);

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
    action: "cancel" | "reactivate" | "renew_trial" | "mark_past_due" | "resolve_past_due",
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
          <Badge tone={subscription?.status === "past_due" ? "warning" : "success"}>
            {subscription?.commercial_status ?? "carregando"}
          </Badge>
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
            <strong>Plano sugerido</strong>
            <span>{subscription?.suggested_plan ?? "-"}</span>
          </article>
          <article className="stat-tile">
            <strong>Cancelamento agendado</strong>
            <span>{subscription?.cancel_at_period_end ? "Sim" : "Nao"}</span>
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
          <article className="brief-card brief-card--wide">
            <strong>Leitura comercial</strong>
            <span>
              {subscription?.cancel_at_period_end
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
          <button className="inline-button" type="button" onClick={() => handleSubscriptionAction("renew_trial")}>
            Renovar trial
          </button>
          <button className="inline-button" type="button" onClick={() => handleSubscriptionAction("mark_past_due")}>
            Marcar pendencia
          </button>
          <button className="inline-button" type="button" onClick={() => handleSubscriptionAction("resolve_past_due")}>
            Resolver pendencia
          </button>
          <button className="inline-button" type="button" onClick={() => handleSubscriptionAction("reactivate")}>
            Reativar
          </button>
          <button className="inline-button" type="button" onClick={() => handleSubscriptionAction("cancel")}>
            Cancelar
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
              <button className="inline-button" type="button" onClick={() => activatePlan(plan.plan)}>
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens?.access_token) return;
    void api
      .listLeads(tokens.access_token)
      .then(setLeads)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Falha ao carregar leads."),
      );
  }, [tokens]);

  return (
    <section className="app-section">
      <div className="panel">
        <div className="section-header">
          <h2>Leads captados</h2>
          <span>{leads.length}</span>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="list-grid">
          {leads.length === 0 ? <p className="meta-copy">Nenhum lead captado ainda.</p> : null}
          {leads.map((lead) => (
            <article className="list-card" key={lead.id}>
              <strong>{lead.name}</strong>
              <span>{lead.email}</span>
              <span>{new Date(lead.created_at).toLocaleString("pt-BR")}</span>
            </article>
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

  async function loadOpponents() {
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
  }

  async function loadEvents(opponentId: string) {
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
  }

  useEffect(() => {
    void loadOpponents();
  }, [tokens, search, tagFilter, stanceFilter, watchLevelFilter]);

  useEffect(() => {
    if (!selectedId) return;
    void loadEvents(selectedId);
  }, [selectedId, tokens, severityFilter]);

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
    critical: summary?.critical_watch_count ?? opponents.filter((item) => item.watch_level === "critical").length,
    incumbent: summary?.stance_distribution?.incumbent ?? opponents.filter((item) => item.stance === "incumbent").length,
    challenger:
      summary?.stance_distribution?.challenger ?? opponents.filter((item) => item.stance === "challenger").length,
  };

  return (
    <section className="app-section split-layout wide-layout">
      <form className="panel form-panel" onSubmit={handleCreateOpponent}>
        <h2>Novo adversario</h2>
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

      <div className="panel">
        <div className="section-header">
          <h2>Adversarios</h2>
          <span>{opponents.length} registros</span>
        </div>
        <div className="list-grid onboarding-guidance-grid">
          <article className="list-card onboarding-guidance">
            <strong>Monitoramento critico</strong>
            <span>{comparison.critical}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Incumbentes</strong>
            <span>{comparison.incumbent}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Desafiantes</strong>
            <span>{comparison.challenger}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Eventos criticos</strong>
            <span>{summary?.critical_events_count ?? 0}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Ultimos 30 dias</strong>
            <span>{summary?.recent_events_count ?? 0}</span>
          </article>
        </div>
        <div className="toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, contexto ou observacoes"
          />
          <input value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} placeholder="Filtrar por tag" />
          <select value={stanceFilter} onChange={(event) => setStanceFilter(event.target.value)}>
            <option value="">Todas as classificacoes</option>
            <option value="challenger">Desafiante</option>
            <option value="incumbent">Incumbente</option>
            <option value="ally_risk">Risco aliado</option>
            <option value="local_force">Forca local</option>
          </select>
          <select value={watchLevelFilter} onChange={(event) => setWatchLevelFilter(event.target.value)}>
            <option value="">Todos os niveis</option>
            <option value="observe">Observar</option>
            <option value="attention">Atencao</option>
            <option value="critical">Critico</option>
          </select>
        </div>
        <div className="list-grid">
          {opponents.map((opponent) => (
            <article
              className={`list-card ${selectedId === opponent.id ? "list-card--selected" : ""}`}
              key={opponent.id}
            >
              <button className="card-link" type="button" onClick={() => setSelectedId(opponent.id)}>
                <strong>{opponent.name}</strong>
                <span>{opponent.context}</span>
                <span>{opponent.stance} - {opponent.watch_level}</span>
                <span>{opponent.tags.join(", ") || "Sem tags"}</span>
              </button>
              <button className="inline-button" type="button" onClick={() => handleDelete(opponent.id)}>
                Remover
              </button>
            </article>
          ))}
        </div>
        <div className="section-header">
          <h2>Watchlist comparativa</h2>
        </div>
        <div className="list-grid">
          {(summary?.top_watchlist ?? []).length === 0 ? (
            <p className="meta-copy">A watchlist comparativa aparece assim que houver monitorados com eventos.</p>
          ) : null}
          {(summary?.top_watchlist ?? []).map((item) => (
            <article className="list-card" key={item.opponent_id}>
              <strong>{item.name}</strong>
              <span>{item.stance} - {item.watch_level}</span>
              <span>{item.total_events} evento(s) no total</span>
              <span>{item.critical_events} critico(s) - {item.recent_events} recentes</span>
              <span>{item.last_event_date ? new Date(item.last_event_date).toLocaleDateString("pt-BR") : "Sem eventos"}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <h2>Timeline</h2>
          <span>{events.length} eventos</span>
        </div>
        <div className="list-grid onboarding-guidance-grid">
          <article className="list-card onboarding-guidance">
            <strong>Selecionado</strong>
            <span>{selectedOpponent?.name ?? "Nenhum adversario selecionado"}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Eventos criticos</strong>
            <span>{criticalEvents}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Eventos recentes</strong>
            <span>{recentEvents}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Contexto</strong>
            <span>{selectedOpponent?.context ?? "Selecione um adversario para detalhar a timeline"}</span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Classificacao</strong>
            <span>
              {selectedOpponent ? `${selectedOpponent.stance} - ${selectedOpponent.watch_level}` : "Sem selecao"}
            </span>
          </article>
          <article className="list-card onboarding-guidance">
            <strong>Ultimo sinal</strong>
            <span>{lastEventDate ? new Date(lastEventDate).toLocaleDateString("pt-BR") : "Sem eventos"}</span>
          </article>
        </div>
        <div className="toolbar">
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
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
        <div className="list-grid">
          {events.length === 0 ? <p className="meta-copy">Nenhum evento registrado para o filtro atual.</p> : null}
          {events.map((item) => (
            <article className="list-card" key={item.id}>
              <div className="section-header">
                <strong>{item.title}</strong>
                <Badge tone={item.severity === "critical" ? "warning" : item.severity === "warning" ? "info" : "neutral"}>
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

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand">Pulso</div>
          <span>workspace politico</span>
        </div>
        <nav>
          <NavLink to="/app">Dashboard</NavLink>
          <NavLink to="/app/onboarding">Onboarding</NavLink>
          <NavLink to="/app/team">Equipe</NavLink>
          <NavLink to="/app/contacts">Contatos</NavLink>
          <NavLink to="/app/tasks">Tarefas</NavLink>
          <NavLink to="/app/opponents">Adversarios</NavLink>
          <NavLink to="/app/reports">Relatorios</NavLink>
          <NavLink to="/app/billing">Assinatura</NavLink>
          <NavLink to="/app/leads">Leads</NavLink>
          <NavLink to="/app/audit">Auditoria</NavLink>
        </nav>
      </aside>
      <section className="app-content">
        <div className="topbar topbar-actions">
          <div>
            <p className="eyebrow">Painel autenticado</p>
            <h1 className="topbar-title">Operacao em andamento</h1>
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
