import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const {
  apiMock,
  billingState,
  contactsState,
  leadsState,
  opponentEventsState,
  opponentsState,
  reportsState,
  sessionPayload,
  tasksState,
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

  const billingState = {
    subscription: {
      id: "sub-1",
      tenant_id: "tenant-1",
      plan: "pro" as const,
      status: "active",
      billing_cycle: "monthly" as const,
      trial_ends_at: "2026-03-20",
      current_period_ends_at: "2026-04-01",
      cancel_at_period_end: false,
      trial_days_remaining: 12,
      seats_included: 3,
      ai_requests_limit: 150,
      report_exports_limit: 34,
      suggested_plan: "executive" as const,
      can_export_reports: true,
      commercial_status: "ativo",
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
      created_at: string;
    }>,
  };

  function buildOpponentsSummary() {
    const criticalEventsCount = opponentEventsState.items.filter(
      (item) => item.severity === "critical",
    ).length;
    const recentEventsCount = opponentEventsState.items.filter((item) => {
      const threshold = new Date("2026-02-06T00:00:00Z");
      return new Date(item.event_date) >= threshold;
    }).length;

    return {
      total_opponents: opponentsState.items.length,
      critical_watch_count: opponentsState.items.filter((item) => item.watch_level === "critical")
        .length,
      critical_events_count: criticalEventsCount,
      recent_events_count: recentEventsCount,
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
          const lastEventDate = [...relatedEvents].sort((left, right) =>
            right.event_date.localeCompare(left.event_date),
          )[0]?.event_date;

          return {
            opponent_id: opponent.id,
            name: opponent.name,
            stance: opponent.stance,
            watch_level: opponent.watch_level,
            total_events: relatedEvents.length,
            critical_events: criticalEvents.length,
            recent_events: recentEvents.length,
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
    listContacts: vi.fn(async () => contactsState.items),
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
        action: "cancel" | "reactivate" | "renew_trial" | "mark_past_due" | "resolve_past_due",
      ) => {
        if (action === "mark_past_due") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "past_due",
            commercial_status: "pendente",
          };
        }
        if (action === "resolve_past_due") {
          billingState.subscription = {
            ...billingState.subscription,
            status: "active",
            commercial_status: "ativo",
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
    listLeads: vi.fn(async () => leadsState.items),
  };

  return {
    apiMock,
    billingState,
    contactsState,
    leadsState,
    opponentEventsState,
    opponentsState,
    reportsState,
    sessionPayload,
    tasksState,
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
    leadsState.items = [
      {
        id: "lead-1",
        name: "Marina Gomes",
        email: "marina@exemplo.com",
        phone: "11999990000",
        city: "Sao Paulo",
        role: "Coordenadora local",
        challenge: "Quer entender a operacao de relatorios.",
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
  });

  it("cria um contato pelo fluxo autenticado", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/contacts");

    await screen.findByRole("heading", { name: "Contatos" });
    await user.type(screen.getByLabelText("Nome"), "Lideranca Centro");
    await user.selectOptions(screen.getByLabelText("Tipo"), "leadership");
    await user.selectOptions(screen.getByLabelText("Status"), "priority");
    await user.type(screen.getByLabelText("Cidade"), "Sao Paulo");
    await user.type(screen.getByLabelText("Tags"), "centro, bairro");
    await user.click(screen.getByRole("button", { name: "Salvar contato" }));

    await waitFor(() => {
      expect(apiMock.createContact).toHaveBeenCalled();
      expect(screen.getByText("Lideranca Centro")).toBeInTheDocument();
      expect(screen.getByText("centro, bairro")).toBeInTheDocument();
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

    await waitFor(() => {
      expect(apiMock.subscriptionAction).toHaveBeenCalledWith("token-valido", "mark_past_due");
      expect(screen.getByText("Acao mark_past_due executada.")).toBeInTheDocument();
      expect(screen.getByText("past_due")).toBeInTheDocument();
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

  it("cria adversario e adiciona evento na timeline autenticada", async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp("/app/opponents");

    await screen.findByRole("heading", { name: "Adversarios" });
    await user.type(screen.getByLabelText("Nome"), "Frente Central");
    await user.type(screen.getByLabelText("Contexto"), "Base forte no centro expandido");
    await user.selectOptions(screen.getByLabelText("Classificacao"), "incumbent");
    await user.selectOptions(screen.getByLabelText("Nivel de monitoramento"), "critical");
    await user.type(screen.getByLabelText("Tags"), "centro, rua");
    await user.type(screen.getByLabelText("Observacoes"), "Exige monitoramento diario.");
    await user.click(screen.getByRole("button", { name: "Salvar adversario" }));

    await waitFor(() => {
      expect(apiMock.createOpponent).toHaveBeenCalled();
      expect(screen.getAllByText("Frente Central").length).toBeGreaterThan(0);
      expect(screen.getAllByText("incumbent - critical").length).toBeGreaterThan(0);
    });

    await user.type(screen.getByLabelText("Titulo"), "Subiu insercao local");
    await user.type(screen.getByLabelText("Data"), "2026-03-08");
    await user.selectOptions(screen.getByLabelText("Severidade"), "critical");
    await user.type(screen.getByLabelText("Descricao"), "Evento critico em bairro prioritario.");
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

  it("renderiza os leads captados no painel autenticado", async () => {
    renderAuthenticatedApp("/app/leads");

    await screen.findByRole("heading", { name: "Leads captados" });

    await waitFor(() => {
      expect(apiMock.listLeads).toHaveBeenCalledWith("token-valido");
      expect(screen.getByText("Marina Gomes")).toBeInTheDocument();
      expect(screen.getByText("Carlos Lima")).toBeInTheDocument();
      expect(screen.getByText("Coordenadora local")).toBeInTheDocument();
      expect(screen.getByText("Sem WhatsApp")).toBeInTheDocument();
    });
  });
});
