import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { BillingEvent, BillingPlan, Subscription } from "./api";

const {
  apiMock,
  auditLogsState,
  billingState,
  campaignsState,
  contactsState,
  leadsState,
  membershipsState,
  onboardingState,
  opponentEventsState,
  opponentsState,
  reportsState,
  sessionPayload,
  tasksState,
  tenantState,
} = vi.hoisted(() => {
  const sessionPayload = {
    tokens: {
      access_token: "token-valido",
      refresh_token: "refresh-valido",
      token_type: "bearer",
    },
    user: {
      id: "user-1",
      full_name: "Antonio Rincon",
      email: "antonio@pulso.local",
      memberships: [{ tenant_id: "tenant-1", role: "owner" as const }],
    },
  };

  const contactsState = {
    items: [] as Array<{
      id: string;
      name: string;
      kind: string;
      status: "new" | "contacted" | "qualified" | "priority" | "inactive";
      email?: string | null;
      phone?: string | null;
      city?: string | null;
      tags: string[];
      note_history: Array<{
        id: string;
        content: string;
        created_at: string;
        created_by: string;
      }>;
      created_at: string;
      updated_at: string;
    }>,
  };

  const tasksState = {
    items: [] as Array<{
      id: string;
      title: string;
      description?: string | null;
      status: string;
      priority: string;
      assignee_name?: string | null;
      due_date?: string | null;
    }>,
  };

  const billingState: {
    subscription: Subscription;
    plans: BillingPlan[];
    events: BillingEvent[];
  } = {
    subscription: {
      id: "sub-1",
      tenant_id: "tenant-1",
      plan: "pro" as const,
      status: "active",
      billing_cycle: "monthly" as const,
      trial_ends_at: "2026-03-20",
      current_period_ends_at: "2026-04-01",
      cancel_at_period_end: false,
      grace_period_ends_at: null,
      last_payment_attempt_at: null,
      failed_payments_count: 0,
      grace_days_remaining: 0,
      trial_days_remaining: 12,
      seat_usage_count: 1,
      seat_usage_ratio: 0.33,
      seat_pressure: "saudavel",
      seats_included: 3,
      ai_requests_limit: 150,
      report_exports_limit: 34,
      suggested_plan: "executive" as const,
      can_export_reports: true,
      commercial_status: "ativo",
      collection_stage: "healthy",
      renewal_risk: "low",
      commercial_motion: "manter",
      recommended_billing_cycle: "monthly",
      next_commercial_action: "manter conta saudavel e mapear upsell",
      next_billing_at: "2026-04-01",
    },
    plans: [
      {
        plan: "pro" as const,
        seats_included: 3,
        ai_requests_limit: 150,
        report_exports_limit: 34,
        recommended_for: "Coordenacao pequena com rotina recorrente.",
      },
    ],
    events: [
      {
        id: "bill-event-1",
        action: "billing.subscription_created",
        title: "Assinatura criada",
        detail: "Plano pro ativo.",
        created_at: "2026-03-08T10:00:00Z",
      },
    ],
  };

  const reportsState = {
    items: [] as Array<{
      id: string;
      title: string;
      report_type: string;
      summary: string;
      created_at: string;
      created_by: string;
      metrics: {
        contacts_count: number;
        priority_contacts_count: number;
        open_tasks_count: number;
        overdue_tasks_count: number;
        opponents_count: number;
        opponent_events_count: number;
      };
    }>,
  };

  const opponentsState = {
    items: [] as Array<{
      id: string;
      name: string;
      context: string;
      stance: "incumbent" | "challenger" | "ally_risk" | "local_force";
      watch_level: "observe" | "attention" | "critical";
      links: string[];
      notes?: string | null;
      tags: string[];
    }>,
  };

  const opponentEventsState = {
    items: [] as Array<{
      id: string;
      opponent_id: string;
      title: string;
      description: string;
      event_date: string;
      severity: string;
    }>,
  };

  const leadsState = {
    items: [] as Array<{
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      city?: string | null;
      role?: string | null;
      challenge?: string | null;
      source?: string;
      stage: string;
      owner_user_id?: string | null;
      owner_name?: string | null;
      follow_up_at?: string | null;
      converted_contact_id?: string | null;
      converted_at?: string | null;
      created_at: string;
    }>,
  };

  const tenantState = {
    tenant: {
      id: "tenant-1",
      name: "Pulso Workspace",
    },
    role: "owner",
  };

  const membershipsState = {
    items: [
      {
        id: "membership-1",
        user_id: "user-1",
        tenant_id: "tenant-1",
        role: "owner" as const,
        email: "antonio@pulso.local",
        full_name: "Antonio Rincon",
        created_at: "2026-03-01T10:00:00Z",
      },
    ] as Array<{
      id: string;
      user_id: string;
      tenant_id: string;
      role: "owner" | "admin" | "coordinator" | "analyst" | "viewer";
      email: string;
      full_name: string;
      created_at: string;
    }>,
  };

  const campaignsState = {
    items: [] as Array<{
      id: string;
      tenant_id: string;
      name: string;
      office: string;
      city?: string | null;
      state?: string | null;
      phase: string;
    }>,
  };

  const onboardingState = {
    value: {
      id: "onboarding-1",
      tenant_id: "tenant-1",
      profile_type: "campaign",
      objective: "ativar workspace",
      campaign_id: null as string | null,
      team_configured: false,
      first_opponent_created: false,
      completed: false,
    },
  };

  const auditLogsState = {
    items: [
      {
        id: "audit-1",
        action: "contacts.created",
        resource_type: "contact",
        created_at: "2026-03-08T12:00:00Z",
      },
      {
        id: "audit-2",
        action: "billing.subscription_updated",
        resource_type: "billing",
        created_at: "2026-03-08T08:00:00Z",
      },
    ],
  };

  const aiState = {
    summaries: {
      dashboard: {
        headline: "Resumo operacional",
        module: "dashboard",
        summary: "A coordenacao precisa fechar as prioridades abertas do workspace.",
        next_action: "Atacar tarefas vencidas.",
        action_reason: "Ha frentes abertas e sinais suficientes para acelerar a execucao.",
        urgency: "alta",
        priority_score: 78,
        trigger_signal: "3 tarefas abertas",
        focus_area: "operacao",
        suggested_owner: "Coordenacao",
        due_window: "Hoje",
        blockers: ["Poucos analistas ativos"],
        supporting_signals: ["3 tarefas abertas", "2 contatos prioritarios"],
        recommendations: ["Revisar backlog", "Atualizar equipe"],
      },
      billing: {
        headline: "Assinatura sob atencao",
        module: "billing",
        summary: "A leitura comercial pede acompanhamento da assinatura.",
        next_action: "Revisar status comercial.",
        action_reason: "O ciclo atual exige decisao sobre continuidade e uso.",
        urgency: "media",
        priority_score: 62,
        trigger_signal: "plano pro em trial",
        focus_area: "receita",
        suggested_owner: "Financeiro",
        due_window: "Esta semana",
        blockers: ["Sem dono comercial claro"],
        supporting_signals: ["Plano pro", "Trial ativo"],
        recommendations: ["Verificar uso", "Ajustar plano"],
      },
    },
  };

  function buildOpponentsSummary() {
    const criticalEventsCount = opponentEventsState.items.filter(
      (item) => item.severity === "critical",
    ).length;
    const recentEventsCount = opponentEventsState.items.filter((item) => {
      const threshold = new Date("2026-02-06T00:00:00Z");
      return new Date(item.event_date) >= threshold;
    }).length;
    const previousWindowEventsCount = opponentEventsState.items.filter((item) => {
      const lowerBound = new Date("2026-01-07T00:00:00Z");
      const upperBound = new Date("2026-02-06T00:00:00Z");
      const eventDate = new Date(item.event_date);
      return eventDate >= lowerBound && eventDate < upperBound;
    }).length;
    const momentumDelta = recentEventsCount - previousWindowEventsCount;

    return {
      total_opponents: opponentsState.items.length,
      total_events_count: opponentEventsState.items.length,
      critical_watch_count: opponentsState.items.filter((item) => item.watch_level === "critical")
        .length,
      critical_events_count: criticalEventsCount,
      recent_events_count: recentEventsCount,
      previous_window_events_count: previousWindowEventsCount,
      momentum_delta: momentumDelta,
      momentum_direction: momentumDelta > 0 ? "up" : momentumDelta < 0 ? "down" : "stable",
      stance_distribution: {
        incumbent: opponentsState.items.filter((item) => item.stance === "incumbent").length,
        challenger: opponentsState.items.filter((item) => item.stance === "challenger").length,
        ally_risk: opponentsState.items.filter((item) => item.stance === "ally_risk").length,
        local_force: opponentsState.items.filter((item) => item.stance === "local_force").length,
      },
      watch_distribution: {
        observe: opponentsState.items.filter((item) => item.watch_level === "observe").length,
        attention: opponentsState.items.filter((item) => item.watch_level === "attention").length,
        critical: opponentsState.items.filter((item) => item.watch_level === "critical").length,
      },
      spotlight: {
        opponent_id: opponentsState.items[0]?.id ?? null,
        name: opponentsState.items[0]?.name ?? "Radar ainda sem volume historico",
        stance: opponentsState.items[0]?.stance ?? "challenger",
        watch_level: opponentsState.items[0]?.watch_level ?? "observe",
        summary: "Leitura comparativa pronta para coordenacao.",
        momentum_direction: momentumDelta > 0 ? "up" : momentumDelta < 0 ? "down" : "stable",
        momentum_delta: momentumDelta,
        recent_events: recentEventsCount,
        critical_events: criticalEventsCount,
        last_event_date: opponentEventsState.items[0]?.event_date ?? null,
      },
      top_watchlist: opponentsState.items
        .map((opponent) => {
          const relatedEvents = opponentEventsState.items.filter(
            (item) => item.opponent_id === opponent.id,
          );
          const criticalEvents = relatedEvents.filter((item) => item.severity === "critical");
          const recentEvents = relatedEvents.filter((item) => {
            const threshold = new Date("2026-02-06T00:00:00Z");
            return new Date(item.event_date) >= threshold;
          });
          const previousWindowEvents = relatedEvents.filter((item) => {
            const lowerBound = new Date("2026-01-07T00:00:00Z");
            const upperBound = new Date("2026-02-06T00:00:00Z");
            const eventDate = new Date(item.event_date);
            return eventDate >= lowerBound && eventDate < upperBound;
          });
          const lastEventDate = [...relatedEvents].sort((left, right) =>
            right.event_date.localeCompare(left.event_date),
          )[0]?.event_date;
          const itemMomentumDelta = recentEvents.length - previousWindowEvents.length;

          return {
            opponent_id: opponent.id,
            name: opponent.name,
            stance: opponent.stance,
            watch_level: opponent.watch_level,
            total_events: relatedEvents.length,
            critical_events: criticalEvents.length,
            recent_events: recentEvents.length,
            previous_window_events: previousWindowEvents.length,
            momentum_delta: itemMomentumDelta,
            momentum_direction:
              itemMomentumDelta > 0 ? "up" : itemMomentumDelta < 0 ? "down" : "stable",
            last_event_date: lastEventDate ?? null,
          };
        })
        .sort((left, right) => right.total_events - left.total_events)
        .slice(0, 3),
    };
  }

  const apiMock = {
    login: vi.fn(),
    register: vi.fn(),
    listContacts: vi.fn(
      async (
        _token: string,
        params?: { query?: string; kind?: string; status?: string; city?: string; tag?: string },
      ) => {
        return contactsState.items.filter((item) => {
          const query = params?.query?.toLowerCase();
          const city = params?.city?.toLowerCase();
          const tag = params?.tag?.toLowerCase();
          const haystack =
            `${item.name} ${item.city ?? ""} ${item.email ?? ""} ${item.phone ?? ""} ${item.tags.join(" ")} ${item.note_history.map((note) => note.content).join(" ")}`.toLowerCase();
          const matchesQuery = query ? haystack.includes(query) : true;
          const matchesKind = params?.kind ? item.kind === params.kind : true;
          const matchesStatus = params?.status ? item.status === params.status : true;
          const matchesCity = city ? (item.city ?? "").toLowerCase().includes(city) : true;
          const matchesTag = tag
            ? item.tags.some((itemTag) => itemTag.toLowerCase().includes(tag))
            : true;
          return matchesQuery && matchesKind && matchesStatus && matchesCity && matchesTag;
        });
      },
    ),
    createContact: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `contact-${contactsState.items.length + 1}`,
        name: String(body.name),
        kind: String(body.kind),
        status: String(body.status) as "new" | "contacted" | "qualified" | "priority" | "inactive",
        email: (body.email as string | null) ?? null,
        phone: (body.phone as string | null) ?? null,
        city: (body.city as string | null) ?? null,
        tags: (body.tags as string[]) ?? [],
        note_history: [],
        created_at: "2026-03-08T10:00:00Z",
        updated_at: "2026-03-08T10:00:00Z",
      };
      contactsState.items = [created, ...contactsState.items];
      return created;
    }),
    updateContact: vi.fn(
      async (_token: string, contactId: string, body: Record<string, unknown>) => {
        contactsState.items = contactsState.items.map((item) =>
          item.id === contactId
            ? {
                ...item,
                status: body.status as "new" | "contacted" | "qualified" | "priority" | "inactive",
                updated_at: "2026-03-08T11:00:00Z",
              }
            : item,
        );
        return contactsState.items.find((item) => item.id === contactId);
      },
    ),
    addContactNote: vi.fn(
      async (_token: string, contactId: string, body: Record<string, unknown>) => {
        contactsState.items = contactsState.items.map((item) =>
          item.id === contactId
            ? {
                ...item,
                note_history: [
                  {
                    id: `note-${item.note_history.length + 1}`,
                    content: String(body.content),
                    created_at: "2026-03-08T12:00:00Z",
                    created_by: "Antonio Rincon",
                  },
                  ...item.note_history,
                ],
                updated_at: "2026-03-08T12:00:00Z",
              }
            : item,
        );
        return contactsState.items.find((item) => item.id === contactId);
      },
    ),
    deleteContact: vi.fn(async (_token: string, contactId: string) => {
      contactsState.items = contactsState.items.filter((item) => item.id !== contactId);
    }),
    listTasks: vi.fn(async () => tasksState.items),
    createTask: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `task-${tasksState.items.length + 1}`,
        title: String(body.title),
        description: (body.description as string | null) ?? null,
        status: String(body.status),
        priority: String(body.priority),
        assignee_name: (body.assignee_name as string | null) ?? null,
        due_date: (body.due_date as string | null) ?? null,
      };
      tasksState.items = [created, ...tasksState.items];
      return created;
    }),
    updateTask: vi.fn(async (_token: string, taskId: string, body: Record<string, unknown>) => {
      tasksState.items = tasksState.items.map((item) =>
        item.id === taskId ? { ...item, status: String(body.status) } : item,
      );
      return tasksState.items.find((item) => item.id === taskId);
    }),
    deleteTask: vi.fn(async (_token: string, taskId: string) => {
      tasksState.items = tasksState.items.filter((item) => item.id !== taskId);
    }),
    getSubscription: vi.fn(async () => billingState.subscription),
    listPlans: vi.fn(async () => billingState.plans),
    listBillingEvents: vi.fn(async () => billingState.events),
    checkout: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      billingState.subscription = {
        ...billingState.subscription,
        plan: body.plan as typeof billingState.subscription.plan,
      };
      return {
        checkout_url: "https://example.com/checkout",
        message: `Plano ${String(body.plan)} ativado.`,
      };
    }),
    subscriptionAction: vi.fn(
      async (
        _token: string,
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
      ) => {
        if (action === "mark_past_due") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "past_due",
            commercial_status: "em_graca",
            collection_stage: "grace",
            renewal_risk: "high",
            commercial_motion: "regularizar",
            grace_period_ends_at: "2026-03-15",
            grace_days_remaining: 7,
            failed_payments_count: billingState.subscription.failed_payments_count + 1,
            next_commercial_action: "cobrar regularizacao antes do fim da graca",
          };
        }
        if (action === "retry_charge") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "past_due",
            commercial_status: "em_graca",
            collection_stage: "grace",
            renewal_risk: "high",
            commercial_motion: "regularizar",
            grace_period_ends_at: "2026-03-15",
            grace_days_remaining: 7,
            failed_payments_count: billingState.subscription.failed_payments_count + 1,
            last_payment_attempt_at: "2026-03-08",
            next_commercial_action: "cobrar regularizacao antes do fim da graca",
          };
        }
        if (action === "resolve_past_due") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "active",
            commercial_status: "ativo",
            collection_stage: "healthy",
            renewal_risk: "low",
            commercial_motion: "manter",
            grace_period_ends_at: null,
            grace_days_remaining: 0,
            last_payment_attempt_at: null,
            failed_payments_count: 0,
            next_commercial_action: "manter conta saudavel e mapear upsell",
          };
        }
        if (action === "expire_subscription") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "canceled",
            commercial_status: "cancelado",
            collection_stage: "churn",
            renewal_risk: "critical",
            commercial_motion: "reter",
            cancel_at_period_end: false,
            grace_period_ends_at: null,
            grace_days_remaining: 0,
            next_commercial_action: "reativar conta e renegociar plano",
          };
        }
        if (action === "switch_to_annual") {
          billingState.subscription = {
            ...billingState.subscription,
            billing_cycle: "annual",
            recommended_billing_cycle: "annual",
          };
        }
        if (action === "switch_to_monthly") {
          billingState.subscription = {
            ...billingState.subscription,
            billing_cycle: "monthly",
            recommended_billing_cycle: "monthly",
          };
        }
        return { message: `Acao ${action} executada.` };
      },
    ),
    listReports: vi.fn(async (_token: string, params?: { report_type?: string }) => {
      if (!params?.report_type) {
        return reportsState.items;
      }
      return reportsState.items.filter((item) => item.report_type === params.report_type);
    }),
    createReport: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `report-${reportsState.items.length + 1}`,
        title: String(body.title),
        report_type: String(body.report_type),
        summary: `Resumo de ${String(body.title)}`,
        created_at: "2026-03-08T13:00:00Z",
        created_by: "Antonio Rincon",
        metrics: {
          contacts_count: contactsState.items.length,
          priority_contacts_count: contactsState.items.filter((item) => item.status === "priority")
            .length,
          open_tasks_count: tasksState.items.filter((item) => item.status !== "done").length,
          overdue_tasks_count: 1,
          opponents_count: opponentsState.items.length,
          opponent_events_count: opponentEventsState.items.length,
        },
      };
      reportsState.items = [created, ...reportsState.items];
      return created;
    }),
    exportReport: vi.fn(async (_token: string, reportId: string, exportFormat: "pdf" | "csv") => {
      const selectedReport = reportsState.items.find((item) => item.id === reportId);
      return {
        filename: `${selectedReport?.title ?? reportId}.${exportFormat}`,
        content: `Export ${exportFormat} de ${selectedReport?.title ?? reportId}`,
        watermark: "local-only",
      };
    }),
    listOpponents: vi.fn(
      async (
        _token: string,
        params?: { query?: string; tag?: string; stance?: string; watch_level?: string },
      ) => {
        return opponentsState.items.filter((item) => {
          const matchesQuery = params?.query
            ? `${item.name} ${item.context} ${item.notes ?? ""}`
                .toLowerCase()
                .includes(params.query.toLowerCase())
            : true;
          const matchesTag = params?.tag ? item.tags.includes(params.tag) : true;
          const matchesStance = params?.stance ? item.stance === params.stance : true;
          const matchesWatchLevel = params?.watch_level
            ? item.watch_level === params.watch_level
            : true;
          return matchesQuery && matchesTag && matchesStance && matchesWatchLevel;
        });
      },
    ),
    getOpponentsSummary: vi.fn(async () => buildOpponentsSummary()),
    createOpponent: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `opponent-${opponentsState.items.length + 1}`,
        name: String(body.name),
        context: String(body.context),
        stance: body.stance as "incumbent" | "challenger" | "ally_risk" | "local_force",
        watch_level: body.watch_level as "observe" | "attention" | "critical",
        links: (body.links as string[]) ?? [],
        notes: (body.notes as string | null) ?? null,
        tags: (body.tags as string[]) ?? [],
      };
      opponentsState.items = [created, ...opponentsState.items];
      onboardingState.value = {
        ...onboardingState.value,
        first_opponent_created: opponentsState.items.length > 0,
        completed:
          Boolean(onboardingState.value.campaign_id) &&
          membershipsState.items.length > 1 &&
          opponentsState.items.length > 0,
      };
      return created;
    }),
    deleteOpponent: vi.fn(async (_token: string, opponentId: string) => {
      opponentsState.items = opponentsState.items.filter((item) => item.id !== opponentId);
      opponentEventsState.items = opponentEventsState.items.filter(
        (item) => item.opponent_id !== opponentId,
      );
    }),
    listOpponentEvents: vi.fn(
      async (_token: string, opponentId: string, params?: { severity?: string }) => {
        return opponentEventsState.items.filter(
          (item) =>
            item.opponent_id === opponentId &&
            (params?.severity ? item.severity === params.severity : true),
        );
      },
    ),
    createOpponentEvent: vi.fn(
      async (_token: string, opponentId: string, body: Record<string, unknown>) => {
        const created = {
          id: `opponent-event-${opponentEventsState.items.length + 1}`,
          opponent_id: opponentId,
          title: String(body.title),
          description: String(body.description),
          event_date: String(body.event_date),
          severity: String(body.severity),
        };
        opponentEventsState.items = [created, ...opponentEventsState.items];
        return created;
      },
    ),
    listLeads: vi.fn(
      async (
        _token: string,
        params?: { query?: string; stage?: string; owner_user_id?: string },
      ) => {
        return leadsState.items.filter(
          (item) =>
            (params?.query
              ? [item.name, item.email, item.phone, item.city, item.challenge]
                  .filter(Boolean)
                  .some((value) =>
                    String(value)
                      .toLowerCase()
                      .includes(params.query?.toLowerCase() ?? ""),
                  )
              : true) &&
            (params?.stage ? item.stage === params.stage : true) &&
            (params?.owner_user_id ? item.owner_user_id === params.owner_user_id : true),
        );
      },
    ),
    updateLead: vi.fn(async (_token: string, leadId: string, body: Record<string, unknown>) => {
      const lead = leadsState.items.find((item) => item.id === leadId);
      if (!lead) {
        throw new Error("Lead nao encontrado.");
      }
      const ownerUserId =
        body.owner_user_id === undefined
          ? (lead.owner_user_id ?? "")
          : String(body.owner_user_id || "");
      const ownerName =
        ownerUserId.length > 0
          ? (membershipsState.items.find((item) => item.user_id === ownerUserId)?.full_name ?? null)
          : null;
      const updatedLead = {
        ...lead,
        stage: String(body.stage ?? lead.stage),
        owner_user_id: ownerUserId.length > 0 ? ownerUserId : null,
        owner_name: ownerName,
        follow_up_at:
          body.follow_up_at === undefined ? lead.follow_up_at : String(body.follow_up_at || ""),
      };
      leadsState.items = leadsState.items.map((item) => (item.id === leadId ? updatedLead : item));
      return updatedLead;
    }),
    convertLead: vi.fn(async (_token: string, leadId: string) => {
      const lead = leadsState.items.find((item) => item.id === leadId);
      if (!lead) {
        throw new Error("Lead nao encontrado.");
      }

      let existingContact = contactsState.items.find(
        (item) => (item.email || "").toLowerCase() === lead.email.toLowerCase(),
      );
      if (!existingContact) {
        existingContact = {
          id: `contact-${contactsState.items.length + 1}`,
          name: lead.name,
          kind: "lead",
          status: "qualified",
          email: lead.email,
          phone: lead.phone ?? null,
          city: lead.city ?? null,
          tags: ["lead_convertido", `origem:${lead.source ?? "website"}`],
          note_history: [],
          created_at: "2026-03-08T14:30:00Z",
          updated_at: "2026-03-08T14:30:00Z",
        };
        contactsState.items = [existingContact, ...contactsState.items];
      }

      const convertedLead = {
        ...lead,
        stage: "converted",
        converted_contact_id: existingContact.id,
        converted_at: "2026-03-08T14:35:00Z",
      };
      leadsState.items = leadsState.items.map((item) =>
        item.id === leadId ? convertedLead : item,
      );
      return convertedLead;
    }),
    currentTenant: vi.fn(async () => tenantState),
    updateCurrentTenant: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      tenantState.tenant = {
        ...tenantState.tenant,
        name: String(body.name ?? tenantState.tenant.name),
      };
      return tenantState.tenant;
    }),
    listMemberships: vi.fn(async () => membershipsState.items),
    inviteMember: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `membership-${membershipsState.items.length + 1}`,
        user_id: `user-${membershipsState.items.length + 1}`,
        tenant_id: "tenant-1",
        role: body.role as "admin" | "coordinator" | "analyst" | "viewer",
        email: String(body.email),
        full_name: String(body.full_name),
        created_at: "2026-03-08T14:00:00Z",
      };
      membershipsState.items = [...membershipsState.items, created];
      onboardingState.value = {
        ...onboardingState.value,
        team_configured: membershipsState.items.length > 1,
        completed:
          Boolean(onboardingState.value.campaign_id) &&
          membershipsState.items.length > 1 &&
          onboardingState.value.first_opponent_created,
      };
      return created;
    }),
    updateMembershipRole: vi.fn(
      async (_token: string, membershipId: string, body: Record<string, unknown>) => {
        membershipsState.items = membershipsState.items.map((item) =>
          item.id === membershipId
            ? {
                ...item,
                role: body.role as "owner" | "admin" | "coordinator" | "analyst" | "viewer",
              }
            : item,
        );
        return membershipsState.items.find((item) => item.id === membershipId);
      },
    ),
    deleteMembership: vi.fn(async (_token: string, membershipId: string) => {
      membershipsState.items = membershipsState.items.filter((item) => item.id !== membershipId);
      onboardingState.value = {
        ...onboardingState.value,
        team_configured: membershipsState.items.length > 1,
        completed:
          Boolean(onboardingState.value.campaign_id) &&
          membershipsState.items.length > 1 &&
          onboardingState.value.first_opponent_created,
      };
    }),
    dashboardSummary: vi.fn(async () => ({
      tenant_name: tenantState.tenant.name,
      contacts_count: contactsState.items.length,
      priority_contacts_count: contactsState.items.filter((item) => item.status === "priority")
        .length,
      leads_count: leadsState.items.length,
      converted_leads_count: leadsState.items.filter((item) => item.converted_contact_id).length,
      pending_leads_count: leadsState.items.filter((item) => !item.converted_contact_id).length,
      open_tasks_count: tasksState.items.filter((item) => item.status !== "done").length,
      overdue_tasks_count: 1,
      opponents_count: opponentsState.items.length,
      reports_count: reportsState.items.length,
      memberships_count: membershipsState.items.length,
      plan: billingState.subscription.plan,
      trial_status: billingState.subscription.status,
      next_action: "Fechar as pendencias operacionais.",
    })),
    getAiSummary: vi.fn(async (_token: string, module = "dashboard") => {
      return (
        aiState.summaries[module as keyof typeof aiState.summaries] ?? aiState.summaries.dashboard
      );
    }),
    getOnboarding: vi.fn(async () => onboardingState.value),
    updateOnboarding: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      onboardingState.value = {
        ...onboardingState.value,
        profile_type: (body.profile_type as string | null) ?? onboardingState.value.profile_type,
        objective: (body.objective as string | null) ?? onboardingState.value.objective,
        campaign_id:
          (body.campaign_id as string | null) === undefined
            ? onboardingState.value.campaign_id
            : ((body.campaign_id as string | null) ?? null),
      };
      onboardingState.value = {
        ...onboardingState.value,
        team_configured: membershipsState.items.length > 1,
        first_opponent_created: opponentsState.items.length > 0,
        completed:
          Boolean(onboardingState.value.campaign_id) &&
          membershipsState.items.length > 1 &&
          opponentsState.items.length > 0,
      };
      return onboardingState.value;
    }),
    listCampaigns: vi.fn(async () => campaignsState.items),
    createCampaign: vi.fn(async (_token: string, body: Record<string, unknown>) => {
      const created = {
        id: `campaign-${campaignsState.items.length + 1}`,
        tenant_id: "tenant-1",
        name: String(body.name),
        office: String(body.office),
        city: (body.city as string | null) ?? null,
        state: (body.state as string | null) ?? null,
        phase: String(body.phase),
      };
      campaignsState.items = [created, ...campaignsState.items];
      return created;
    }),
    listAuditLogs: vi.fn(async () => auditLogsState.items),
  };

  return {
    apiMock,
    auditLogsState,
    billingState,
    campaignsState,
    contactsState,
    leadsState,
    membershipsState,
    onboardingState,
    opponentEventsState,
    opponentsState,
    reportsState,
    sessionPayload,
    tasksState,
    tenantState,
  };
});

vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return {
    ...actual,
    api: apiMock,
  };
});

function renderAuthenticatedApp(initialEntry: string) {
  window.localStorage.setItem("pulso-auth", JSON.stringify(sessionPayload));

  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={[initialEntry]}
    >
      <App />
    </MemoryRouter>,
  );
}

describe("App authenticated flows", () => {
  beforeEach(() => {
    window.localStorage.clear();
    contactsState.items = [];
    tasksState.items = [
      {
        id: "task-1",
        title: "Revisar agenda regional",
        description: "Priorizar alinhamento da semana.",
        status: "backlog",
        priority: "high",
        assignee_name: "Coordenacao",
        due_date: "2026-03-12",
      },
    ];
    reportsState.items = [];
    opponentsState.items = [];
    opponentEventsState.items = [];
    campaignsState.items = [];
    membershipsState.items = [
      {
        id: "membership-1",
        user_id: "user-1",
        tenant_id: "tenant-1",
        role: "owner",
        email: "antonio@pulso.local",
        full_name: "Antonio Rincon",
        created_at: "2026-03-01T10:00:00Z",
      },
    ];
    tenantState.tenant = {
      id: "tenant-1",
      name: "Pulso Workspace",
    };
    onboardingState.value = {
      id: "onboarding-1",
      tenant_id: "tenant-1",
      profile_type: "campaign",
      objective: "ativar workspace",
      campaign_id: null,
      team_configured: false,
      first_opponent_created: false,
      completed: false,
    };
    auditLogsState.items = [
      {
        id: "audit-1",
        action: "contacts.created",
        resource_type: "contact",
        created_at: "2026-03-08T12:00:00Z",
      },
      {
        id: "audit-2",
        action: "billing.subscription_updated",
        resource_type: "billing",
        created_at: "2026-03-08T08:00:00Z",
      },
    ];
    leadsState.items = [
      {
        id: "lead-1",
        name: "Marina Gomes",
        email: "marina@exemplo.com",
        phone: "11999990000",
        city: "Sao Paulo",
        role: "Coordenadora local",
        challenge: "Quer entender a operacao de relatorios.",
        source: "website",
        stage: "captured",
        owner_user_id: null,
        owner_name: null,
        follow_up_at: null,
        converted_contact_id: null,
        converted_at: null,
        created_at: "2026-03-07T10:00:00Z",
      },
      {
        id: "lead-2",
        name: "Carlos Lima",
        email: "carlos@exemplo.com",
        phone: null,
        city: null,
        role: null,
        challenge: null,
        source: "indicado",
        stage: "qualified",
        owner_user_id: "user-1",
        owner_name: "Antonio Rincon",
        follow_up_at: "2026-03-10",
        converted_contact_id: null,
        converted_at: null,
        created_at: "2026-02-20T10:00:00Z",
      },
    ];
    billingState.subscription = {
      ...billingState.subscription,
      plan: "pro",
      status: "active",
      commercial_status: "ativo",
      cancel_at_period_end: false,
    };
    apiMock.listContacts.mockClear();
    apiMock.createContact.mockClear();
    apiMock.updateContact.mockClear();
    apiMock.updateLead.mockClear();
    apiMock.convertLead.mockClear();
    apiMock.addContactNote.mockClear();
    apiMock.listTasks.mockClear();
    apiMock.updateTask.mockClear();
    apiMock.getSubscription.mockClear();
    apiMock.subscriptionAction.mockClear();
    apiMock.listReports.mockClear();
    apiMock.createReport.mockClear();
    apiMock.exportReport.mockClear();
    apiMock.listOpponents.mockClear();
    apiMock.getOpponentsSummary.mockClear();
    apiMock.createOpponent.mockClear();
    apiMock.listOpponentEvents.mockClear();
    apiMock.createOpponentEvent.mockClear();
    apiMock.listLeads.mockClear();
    apiMock.currentTenant.mockClear();
    apiMock.updateCurrentTenant.mockClear();
    apiMock.listMemberships.mockClear();
    apiMock.inviteMember.mockClear();
    apiMock.updateMembershipRole.mockClear();
    apiMock.deleteMembership.mockClear();
    apiMock.dashboardSummary.mockClear();
    apiMock.getAiSummary.mockClear();
    apiMock.getOnboarding.mockClear();
    apiMock.updateOnboarding.mockClear();
    apiMock.listCampaigns.mockClear();
    apiMock.createCampaign.mockClear();
    apiMock.listAuditLogs.mockClear();
  });

  it("cria um contato pelo fluxo autenticado", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/contacts");

    await screen.findByRole("heading", { name: "Contatos" });
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Lideranca Centro" } });
    await user.selectOptions(screen.getByLabelText("Tipo"), "leadership");
    await user.selectOptions(screen.getByLabelText("Status"), "priority");
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Sao Paulo" } });
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "centro, bairro" } });
    await user.click(screen.getByRole("button", { name: "Salvar contato" }));

    await waitFor(() => {
      expect(apiMock.createContact).toHaveBeenCalled();
      expect(screen.getByText("Lideranca Centro")).toBeInTheDocument();
      expect(screen.getByText("centro, bairro")).toBeInTheDocument();
    });
  });

  it("aplica e limpa filtros na tela de contatos", async () => {
    const user = userEvent.setup();
    contactsState.items = [
      {
        id: "contact-1",
        name: "Lideranca Centro",
        kind: "leadership",
        status: "priority",
        email: "centro@pulso.local",
        phone: "11999990000",
        city: "Sao Paulo",
        tags: ["centro", "bairro"],
        note_history: [],
        created_at: "2026-03-08T10:00:00Z",
        updated_at: "2026-03-08T10:00:00Z",
      },
      {
        id: "contact-2",
        name: "Imprensa Litoral",
        kind: "press",
        status: "contacted",
        email: "litoral@pulso.local",
        phone: "21999990000",
        city: "Santos",
        tags: ["imprensa"],
        note_history: [],
        created_at: "2026-03-08T10:00:00Z",
        updated_at: "2026-03-08T10:00:00Z",
      },
    ];

    renderAuthenticatedApp("/app/contacts");

    await screen.findByRole("heading", { name: "Contatos" });
    await user.type(
      screen.getByPlaceholderText("Buscar por nome, cidade, tag, email, telefone ou historico"),
      "Centro",
    );
    await user.type(screen.getByPlaceholderText("Filtrar por tag"), "bairro");
    await user.type(screen.getByPlaceholderText("Filtrar por cidade"), "Sao Paulo");

    await waitFor(() => {
      expect(apiMock.listContacts).toHaveBeenLastCalledWith("token-valido", {
        query: "Centro",
        kind: "",
        status: "",
        tag: "bairro",
        city: "Sao Paulo",
      });
      expect(screen.getByText("Lideranca Centro")).toBeInTheDocument();
      expect(screen.queryByText("Imprensa Litoral")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await waitFor(() => {
      expect(apiMock.listContacts).toHaveBeenLastCalledWith("token-valido", {
        query: "",
        kind: "",
        status: "",
        tag: "",
        city: "",
      });
      expect(screen.getByText("Imprensa Litoral")).toBeInTheDocument();
    });
  });

  it("avanca uma tarefa no board autenticado", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/tasks");

    await screen.findByRole("heading", { name: "Tarefas" });
    await user.click(screen.getByRole("button", { name: "Avancar etapa" }));

    await waitFor(() => {
      expect(apiMock.updateTask).toHaveBeenCalledWith("token-valido", "task-1", {
        status: "in_progress",
      });
    });
  });

  it("responde a uma acao comercial na tela de billing", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/billing");

    await screen.findByRole("heading", { name: /^Assinatura$/ });
    await user.click(screen.getByRole("button", { name: "Marcar pendencia" }));
    await user.click(screen.getByRole("button", { name: "Tentar cobranca" }));

    await waitFor(() => {
      expect(apiMock.subscriptionAction).toHaveBeenCalledWith("token-valido", "retry_charge");
      expect(screen.getByText("Acao retry_charge executada.")).toBeInTheDocument();
      expect(screen.getByText("past_due")).toBeInTheDocument();
      expect(screen.getByText("grace")).toBeInTheDocument();
      expect(screen.getByText("2026-03-15")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Migrar para anual" }));

    await waitFor(() => {
      expect(apiMock.subscriptionAction).toHaveBeenCalledWith("token-valido", "switch_to_annual");
      expect(screen.getAllByText("annual").length).toBeGreaterThan(0);
    });
  });

  it("gera e exporta um relatorio na area autenticada", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/reports");

    await screen.findByRole("heading", { name: "Relatorios" });
    await user.type(screen.getByLabelText("Titulo"), "Radar semanal");
    await user.selectOptions(screen.getByLabelText("Tipo"), "executive");
    await user.click(screen.getByRole("button", { name: "Gerar relatorio" }));

    await waitFor(() => {
      expect(apiMock.createReport).toHaveBeenCalledWith("token-valido", {
        title: "Radar semanal",
        report_type: "executive",
      });
      expect(screen.getByText("Relatorio gerado.")).toBeInTheDocument();
      expect(screen.getByText("Radar semanal")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Exportar CSV" }));

    await waitFor(() => {
      expect(apiMock.exportReport).toHaveBeenCalledWith("token-valido", "report-1", "csv");
      expect(screen.getByText(/Radar semanal\.csv/)).toBeInTheDocument();
      expect(screen.getByText(/Export csv de Radar semanal/)).toBeInTheDocument();
    });
  });

  it("filtra relatorios por tipo na area autenticada", async () => {
    const user = userEvent.setup();
    reportsState.items = [
      {
        id: "report-1",
        title: "Radar executivo",
        report_type: "executive",
        summary: "Leitura executiva.",
        created_at: "2026-03-08T13:00:00Z",
        created_by: "Antonio Rincon",
        metrics: {
          contacts_count: 3,
          priority_contacts_count: 1,
          open_tasks_count: 2,
          overdue_tasks_count: 0,
          opponents_count: 1,
          opponent_events_count: 0,
        },
      },
      {
        id: "report-2",
        title: "Radar comparativo",
        report_type: "comparative",
        summary: "Leitura comparativa.",
        created_at: "2026-03-08T13:00:00Z",
        created_by: "Antonio Rincon",
        metrics: {
          contacts_count: 5,
          priority_contacts_count: 2,
          open_tasks_count: 4,
          overdue_tasks_count: 1,
          opponents_count: 2,
          opponent_events_count: 3,
        },
      },
    ];

    renderAuthenticatedApp("/app/reports");

    await screen.findByRole("heading", { name: "Relatorios" });
    await user.selectOptions(screen.getByDisplayValue("Todos os tipos"), "comparative");

    await waitFor(() => {
      expect(apiMock.listReports).toHaveBeenLastCalledWith("token-valido", {
        report_type: "comparative",
      });
      expect(screen.getByText("Radar comparativo")).toBeInTheDocument();
      expect(screen.queryByText("Radar executivo")).not.toBeInTheDocument();
    });
  });

  it("cria adversario e adiciona evento na timeline autenticada", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/opponents");

    await screen.findByRole("heading", { name: "Adversarios" });
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Frente Central" } });
    fireEvent.change(screen.getByLabelText("Contexto"), {
      target: { value: "Base forte no centro expandido" },
    });
    await user.selectOptions(screen.getByLabelText("Classificacao"), "incumbent");
    await user.selectOptions(screen.getByLabelText("Nivel de monitoramento"), "critical");
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "centro, rua" } });
    fireEvent.change(screen.getByLabelText("Observacoes"), {
      target: { value: "Exige monitoramento diario." },
    });
    await user.click(screen.getByRole("button", { name: "Salvar adversario" }));

    await waitFor(() => {
      expect(apiMock.createOpponent).toHaveBeenCalled();
      expect(screen.getAllByText("Frente Central").length).toBeGreaterThan(0);
      expect(screen.getAllByText("incumbent - critical").length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByLabelText("Titulo"), {
      target: { value: "Subiu insercao local" },
    });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-03-08" } });
    await user.selectOptions(screen.getByLabelText("Severidade"), "critical");
    fireEvent.change(screen.getByLabelText("Descricao"), {
      target: { value: "Evento critico em bairro prioritario." },
    });
    await user.click(screen.getByRole("button", { name: "Adicionar evento" }));

    await waitFor(() => {
      expect(apiMock.createOpponentEvent).toHaveBeenCalledWith("token-valido", "opponent-1", {
        title: "Subiu insercao local",
        description: "Evento critico em bairro prioritario.",
        event_date: "2026-03-08",
        severity: "critical",
      });
      expect(screen.getByText("Subiu insercao local")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
    });
  });

  it("mostra leitura temporal na area de adversarios", async () => {
    opponentsState.items = [
      {
        id: "opponent-1",
        name: "Adversario Centro",
        context: "Base forte no centro",
        stance: "incumbent",
        watch_level: "critical",
        links: [],
        notes: "Em pressao crescente",
        tags: ["centro"],
      },
    ];
    opponentEventsState.items = [
      {
        id: "event-1",
        opponent_id: "opponent-1",
        title: "Agenda ampliada",
        description: "Mais rua no ultimo ciclo.",
        event_date: "2026-03-02",
        severity: "critical",
      },
      {
        id: "event-2",
        opponent_id: "opponent-1",
        title: "Novo apoio local",
        description: "Ganho territorial recente.",
        event_date: "2026-02-20",
        severity: "warning",
      },
      {
        id: "event-3",
        opponent_id: "opponent-1",
        title: "Movimento anterior",
        description: "Janela historica previa.",
        event_date: "2026-01-15",
        severity: "info",
      },
    ];
    renderAuthenticatedApp("/app/opponents");

    await screen.findByRole("heading", { name: "Adversarios" });

    await waitFor(() => {
      expect(screen.getByText(/Pressao em alta/)).toBeInTheDocument();
      expect(screen.getByText(/Spotlight temporal/)).toBeInTheDocument();
      expect(screen.getAllByText(/delta/i).length).toBeGreaterThan(0);
    });
  });

  it("renderiza os leads captados no painel autenticado", async () => {
    renderAuthenticatedApp("/app/leads");

    await screen.findByRole("heading", { name: "Leads captados" });

    await waitFor(() => {
      expect(apiMock.listLeads).toHaveBeenCalledWith("token-valido", {
        query: undefined,
        stage: undefined,
        owner_user_id: undefined,
      });
      expect(screen.getByText("Marina Gomes")).toBeInTheDocument();
      expect(screen.getByText("Carlos Lima")).toBeInTheDocument();
      expect(screen.getByText("Coordenadora local")).toBeInTheDocument();
      expect(screen.getByText("Sem WhatsApp")).toBeInTheDocument();
    });
  });

  it("atualiza o funil e filtra leads por estagio", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/leads");

    await screen.findByRole("heading", { name: "Leads captados" });
    await user.selectOptions(screen.getAllByDisplayValue("Captado")[0], "follow_up");
    await user.selectOptions(screen.getAllByDisplayValue("Sem dono")[0], "user-1");

    await waitFor(() => {
      expect(apiMock.updateLead).toHaveBeenCalledWith("token-valido", "lead-1", {
        stage: "follow_up",
      });
      expect(apiMock.updateLead).toHaveBeenCalledWith("token-valido", "lead-1", {
        owner_user_id: "user-1",
      });
      expect(screen.getByText("Lead atualizado no funil comercial.")).toBeInTheDocument();
      expect(screen.getAllByText("Dono: Antonio Rincon").length).toBeGreaterThan(0);
    });

    await user.selectOptions(screen.getByDisplayValue("Todos os estagios"), "follow_up");

    await waitFor(() => {
      expect(apiMock.listLeads).toHaveBeenLastCalledWith("token-valido", {
        query: undefined,
        stage: "follow_up",
        owner_user_id: undefined,
      });
      expect(screen.getByText("Marina Gomes")).toBeInTheDocument();
      expect(screen.queryByText("Carlos Lima")).not.toBeInTheDocument();
    });
  });

  it("converte lead em contato no painel autenticado", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/leads");

    await screen.findByRole("heading", { name: "Leads captados" });
    await user.click(screen.getAllByRole("button", { name: "Converter para contato" })[0]);

    await waitFor(() => {
      expect(apiMock.convertLead).toHaveBeenCalledWith("token-valido", "lead-1");
      expect(screen.getByText("Lead convertido para contato com sucesso.")).toBeInTheDocument();
      expect(screen.getByText("Convertido em contato")).toBeInTheDocument();
      expect(screen.getByText(/^Convertido em \d{2}\/\d{2}\/\d{4}$/)).toBeInTheDocument();
    });

    expect(contactsState.items.some((item) => item.email === "marina@exemplo.com")).toBe(true);
  });

  it("atualiza a leitura do dashboard ao trocar o modulo de IA", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app");

    await screen.findByRole("heading", { name: "Visao geral" });

    await waitFor(() => {
      expect(apiMock.dashboardSummary).toHaveBeenCalledWith("token-valido");
      expect(apiMock.getAiSummary).toHaveBeenCalledWith("token-valido", "dashboard");
      expect(screen.getByText("Atacar tarefas vencidas.")).toBeInTheDocument();
      expect(screen.getByText("78/100")).toBeInTheDocument();
      expect(screen.getAllByText("3 tarefas abertas").length).toBeGreaterThan(0);
      expect(screen.getByText("Leads pendentes")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByDisplayValue("Workspace"), "billing");

    await waitFor(() => {
      expect(apiMock.getAiSummary).toHaveBeenCalledWith("token-valido", "billing");
      expect(screen.getByText("Revisar status comercial.")).toBeInTheDocument();
      expect(screen.getByText("Assinatura sob atencao")).toBeInTheDocument();
      expect(screen.getByText("62/100")).toBeInTheDocument();
    });
  });

  it("configura a campanha inicial no onboarding", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/onboarding");

    await screen.findByRole("heading", { name: "Ative o workspace sem sair do fluxo" });
    await user.selectOptions(screen.getByDisplayValue("Campanha"), "mandate");
    fireEvent.change(screen.getByLabelText("Objetivo inicial"), {
      target: { value: "organizar base territorial" },
    });
    fireEvent.change(screen.getByLabelText("Nome da campanha"), {
      target: { value: "Mandato Centro" },
    });
    fireEvent.change(screen.getByLabelText("Cargo"), { target: { value: "Vereador" } });
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Sao Paulo" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "SP" } });
    await user.selectOptions(screen.getByDisplayValue("Pre-campanha"), "mandate");
    await user.click(screen.getByRole("button", { name: "Salvar campanha inicial" }));

    await waitFor(() => {
      expect(apiMock.createCampaign).toHaveBeenCalledWith("token-valido", {
        name: "Mandato Centro",
        office: "Vereador",
        city: "Sao Paulo",
        state: "SP",
        phase: "mandate",
      });
      expect(apiMock.updateOnboarding).toHaveBeenCalledWith("token-valido", {
        profile_type: "mandate",
        objective: "organizar base territorial",
        campaign_id: "campaign-1",
      });
      expect(screen.getByText("Campanha inicial registrada.")).toBeInTheDocument();
      expect(screen.getByText("Mandato Centro · Vereador")).toBeInTheDocument();
    });
  });

  it("gerencia identidade e time na tela de equipe", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/team");

    await screen.findByRole("heading", { name: "Equipe" });
    const workspaceInput = screen.getByLabelText("Nome do workspace");
    fireEvent.change(workspaceInput, { target: { value: "Pulso Premium" } });
    await user.click(screen.getByRole("button", { name: "Atualizar identidade" }));

    await waitFor(() => {
      expect(apiMock.updateCurrentTenant).toHaveBeenCalledWith("token-valido", {
        name: "Pulso Premium",
      });
      expect(screen.getByText("Workspace atualizado.")).toBeInTheDocument();
      expect(screen.getAllByText("Pulso Premium").length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Marina Operacoes" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "marina@pulso.local" },
    });
    await user.selectOptions(screen.getByDisplayValue("Analise"), "coordinator");
    await user.click(screen.getByRole("button", { name: "Enviar convite" }));

    await waitFor(() => {
      expect(apiMock.inviteMember).toHaveBeenCalledWith("token-valido", {
        email: "marina@pulso.local",
        full_name: "Marina Operacoes",
        role: "coordinator",
      });
      expect(screen.getByText("Membro adicionado ao workspace.")).toBeInTheDocument();
      expect(screen.getByText("Marina Operacoes")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByDisplayValue("Coordenacao"), "admin");

    await waitFor(() => {
      expect(apiMock.updateMembershipRole).toHaveBeenCalledWith("token-valido", "membership-2", {
        role: "admin",
      });
      expect(screen.getByText("Role atualizada.")).toBeInTheDocument();
    });
  });

  it("renderiza a trilha de auditoria autenticada", async () => {
    renderAuthenticatedApp("/app/audit");

    await screen.findByRole("heading", { name: "Auditoria" });

    await waitFor(() => {
      expect(apiMock.listAuditLogs).toHaveBeenCalledWith("token-valido");
      expect(screen.getByText("contacts.created")).toBeInTheDocument();
      expect(screen.getByText("billing.subscription_updated")).toBeInTheDocument();
      expect(screen.getByText("Recurso: contact")).toBeInTheDocument();
    });
  });

  it("mostra estado vazio em leads quando nao ha captacao", async () => {
    leadsState.items = [];
    renderAuthenticatedApp("/app/leads");

    await screen.findByRole("heading", { name: "Leads captados" });

    await waitFor(() => {
      expect(screen.getByText("Nenhum lead captado ainda.")).toBeInTheDocument();
      expect(screen.getByText("Total captado")).toBeInTheDocument();
    });
  });

  it("mostra erro na auditoria quando a carga falha", async () => {
    apiMock.listAuditLogs.mockRejectedValueOnce(new Error("Auditoria indisponivel."));
    renderAuthenticatedApp("/app/audit");

    await screen.findByRole("heading", { name: "Auditoria" });

    await waitFor(() => {
      expect(screen.getByText("Auditoria indisponivel.")).toBeInTheDocument();
    });
  });
});
