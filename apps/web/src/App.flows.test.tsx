import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const { apiMock, billingState, contactsState, sessionPayload, tasksState } = vi.hoisted(() => {
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
  };

  return { apiMock, billingState, contactsState, sessionPayload, tasksState };
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
});
