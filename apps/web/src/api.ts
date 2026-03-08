function resolveApiUrl() {
  if (typeof window !== "undefined") {
    const runtimeWindow = window as Window & { __PULSO_API_URL__?: string };
    if (typeof runtimeWindow.__PULSO_API_URL__ === "string" && runtimeWindow.__PULSO_API_URL__.length > 0) {
      return runtimeWindow.__PULSO_API_URL__;
    }

    const metaApiUrl = document.querySelector('meta[name="pulso-api-url"]')?.getAttribute("content");
    if (typeof metaApiUrl === "string" && metaApiUrl.length > 0) {
      return metaApiUrl;
    }
  }

  return "http://localhost:8000";
}

const API_URL = resolveApiUrl();

export type AuthResponse = {
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
  user: {
    id: string;
    full_name: string;
    email: string;
    memberships: Array<{
      tenant_id: string;
      role: "owner" | "admin" | "coordinator" | "analyst" | "viewer";
    }>;
  };
};

export type Contact = {
  id: string;
  name: string;
  kind: string;
  status: "new" | "contacted" | "qualified" | "priority" | "inactive";
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  notes?: string | null;
  tags: string[];
  note_history: Array<{
    id: string;
    content: string;
    created_at: string;
    created_by: string;
  }>;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assignee_name?: string | null;
  due_date?: string | null;
};

export type Opponent = {
  id: string;
  name: string;
  context: string;
  stance: "incumbent" | "challenger" | "ally_risk" | "local_force";
  watch_level: "observe" | "attention" | "critical";
  links: string[];
  notes?: string | null;
  tags: string[];
};

export type OpponentEvent = {
  id: string;
  opponent_id: string;
  title: string;
  description: string;
  event_date: string;
  severity: string;
};

export type OpponentSummary = {
  total_opponents: number;
  critical_watch_count: number;
  critical_events_count: number;
  recent_events_count: number;
  stance_distribution: Record<string, number>;
  watch_distribution: Record<string, number>;
  top_watchlist: Array<{
    opponent_id: string;
    name: string;
    stance: string;
    watch_level: string;
    total_events: number;
    critical_events: number;
    recent_events: number;
    last_event_date?: string | null;
  }>;
};

export type OnboardingState = {
  id: string;
  tenant_id: string;
  profile_type?: string | null;
  objective?: string | null;
  campaign_id?: string | null;
  team_configured: boolean;
  first_opponent_created: boolean;
  completed: boolean;
};

export type Campaign = {
  id: string;
  tenant_id: string;
  name: string;
  office: string;
  city?: string | null;
  state?: string | null;
  phase: string;
};

export type Subscription = {
  id: string;
  tenant_id: string;
  plan: "essential" | "pro" | "executive" | "enterprise";
  status: string;
  billing_cycle: "monthly" | "annual";
  trial_ends_at?: string | null;
  current_period_ends_at?: string | null;
  cancel_at_period_end: boolean;
  trial_days_remaining: number;
  seats_included: number;
  ai_requests_limit: number;
  report_exports_limit: number;
  suggested_plan: "essential" | "pro" | "executive" | "enterprise";
  can_export_reports: boolean;
  commercial_status: string;
  next_billing_at?: string | null;
};

export type BillingPlan = {
  plan: "essential" | "pro" | "executive" | "enterprise";
  seats_included: number;
  ai_requests_limit: number;
  report_exports_limit: number;
  recommended_for: string;
};

export type BillingEvent = {
  id: string;
  action: string;
  title: string;
  detail: string;
  created_at: string;
};

export type Report = {
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
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  tenant_id: string;
  role: "owner" | "admin" | "coordinator" | "analyst" | "viewer";
  email: string;
  full_name: string;
  created_at: string;
};

export type AiSummary = {
  headline: string;
  module: string;
  summary: string;
  next_action: string;
  action_reason: string;
  urgency: string;
  recommendations: string[];
};

export type DashboardSummary = {
  tenant_name: string;
  contacts_count: number;
  priority_contacts_count: number;
  open_tasks_count: number;
  overdue_tasks_count: number;
  opponents_count: number;
  reports_count: number;
  memberships_count: number;
  plan: string;
  trial_status: string;
  next_action: string;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Falha na requisicao.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  register(fullName: string, email: string, password: string, tenantName: string) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: { full_name: fullName, email, password, tenant_name: tenantName },
    });
  },
  me(token: string) {
    return request<AuthResponse["user"]>("/auth/me", { token });
  },
  currentTenant(token: string) {
    return request<{ tenant: { id: string; name: string }; role: string }>("/tenants/current", {
      token,
    });
  },
  updateCurrentTenant(token: string, body: Record<string, unknown>) {
    return request<{ id: string; name: string }>("/tenants/current", {
      method: "PATCH",
      token,
      body,
    });
  },
  dashboardSummary(token: string) {
    return request<DashboardSummary>("/dashboard/summary", { token });
  },
  listContacts(token: string, params?: { query?: string; kind?: string; status?: string; city?: string; tag?: string }) {
    const search = new URLSearchParams();
    if (params?.query) search.set("query", params.query);
    if (params?.kind) search.set("kind", params.kind);
    if (params?.status) search.set("status", params.status);
    if (params?.city) search.set("city", params.city);
    if (params?.tag) search.set("tag", params.tag);
    return request<Contact[]>(`/contacts${search.size ? `?${search.toString()}` : ""}`, { token });
  },
  createContact(token: string, body: Record<string, unknown>) {
    return request<Contact>("/contacts", { method: "POST", token, body });
  },
  updateContact(token: string, contactId: string, body: Record<string, unknown>) {
    return request<Contact>(`/contacts/${contactId}`, { method: "PATCH", token, body });
  },
  addContactNote(token: string, contactId: string, body: Record<string, unknown>) {
    return request<Contact>(`/contacts/${contactId}/notes`, { method: "POST", token, body });
  },
  deleteContact(token: string, contactId: string) {
    return request<void>(`/contacts/${contactId}`, { method: "DELETE", token });
  },
  listTasks(token: string, params?: { query?: string; status?: string; priority?: string }) {
    const search = new URLSearchParams();
    if (params?.query) search.set("query", params.query);
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    return request<Task[]>(`/tasks${search.size ? `?${search.toString()}` : ""}`, { token });
  },
  createTask(token: string, body: Record<string, unknown>) {
    return request<Task>("/tasks", { method: "POST", token, body });
  },
  updateTask(token: string, taskId: string, body: Record<string, unknown>) {
    return request<Task>(`/tasks/${taskId}`, { method: "PATCH", token, body });
  },
  deleteTask(token: string, taskId: string) {
    return request<void>(`/tasks/${taskId}`, { method: "DELETE", token });
  },
  listOpponents(token: string, params?: { query?: string; tag?: string; stance?: string; watch_level?: string }) {
    const search = new URLSearchParams();
    if (params?.query) search.set("query", params.query);
    if (params?.tag) search.set("tag", params.tag);
    if (params?.stance) search.set("stance", params.stance);
    if (params?.watch_level) search.set("watch_level", params.watch_level);
    return request<Opponent[]>(`/opponents${search.size ? `?${search.toString()}` : ""}`, { token });
  },
  getOpponentsSummary(token: string) {
    return request<OpponentSummary>("/opponents/summary", { token });
  },
  createOpponent(token: string, body: Record<string, unknown>) {
    return request<Opponent>("/opponents", { method: "POST", token, body });
  },
  deleteOpponent(token: string, opponentId: string) {
    return request<void>(`/opponents/${opponentId}`, { method: "DELETE", token });
  },
  listOpponentEvents(token: string, opponentId: string, params?: { severity?: string }) {
    const search = new URLSearchParams();
    if (params?.severity) search.set("severity", params.severity);
    return request<OpponentEvent[]>(`/opponents/${opponentId}/events${search.size ? `?${search.toString()}` : ""}`, {
      token,
    });
  },
  createOpponentEvent(token: string, opponentId: string, body: Record<string, unknown>) {
    return request<OpponentEvent>(`/opponents/${opponentId}/events`, {
      method: "POST",
      token,
      body,
    });
  },
  listAuditLogs(token: string) {
    return request<Array<{ id: string; action: string; resource_type: string; created_at: string }>>(
      "/audit",
      { token },
    );
  },
  createLead(body: Record<string, unknown>) {
    return request<{ id: string; name: string; email: string; created_at: string }>("/public/leads", {
      method: "POST",
      body,
    });
  },
  listLeads(token: string) {
    return request<Lead[]>("/leads", { token });
  },
  listMemberships(token: string) {
    return request<Membership[]>("/memberships", { token });
  },
  inviteMember(token: string, body: Record<string, unknown>) {
    return request<Membership>("/memberships/invite", { method: "POST", token, body });
  },
  updateMembershipRole(token: string, membershipId: string, body: Record<string, unknown>) {
    return request<Membership>(`/memberships/${membershipId}/role`, {
      method: "PATCH",
      token,
      body,
    });
  },
  deleteMembership(token: string, membershipId: string) {
    return request<void>(`/memberships/${membershipId}`, {
      method: "DELETE",
      token,
    });
  },
  getAiSummary(token: string, module = "dashboard") {
    return request<AiSummary>(`/ai/summary?module=${encodeURIComponent(module)}`, { token });
  },
  getOnboarding(token: string) {
    return request<OnboardingState>("/onboarding", { token });
  },
  updateOnboarding(token: string, body: Record<string, unknown>) {
    return request<OnboardingState>("/onboarding", { method: "PATCH", token, body });
  },
  listCampaigns(token: string) {
    return request<Campaign[]>("/onboarding/campaigns", { token });
  },
  createCampaign(token: string, body: Record<string, unknown>) {
    return request<Campaign>("/onboarding/campaigns", { method: "POST", token, body });
  },
  getSubscription(token: string) {
    return request<Subscription>("/billing/subscription", { token });
  },
  listPlans(token: string) {
    return request<BillingPlan[]>("/billing/plans", { token });
  },
  listBillingEvents(token: string) {
    return request<BillingEvent[]>("/billing/events", { token });
  },
  checkout(token: string, body: Record<string, unknown>) {
    return request<{ checkout_url: string; message: string }>("/billing/checkout", {
      method: "POST",
      token,
      body,
    });
  },
  subscriptionAction(token: string, action: "cancel" | "reactivate" | "renew_trial" | "mark_past_due" | "resolve_past_due") {
    return request<{ message: string }>("/billing/subscription/action", {
      method: "POST",
      token,
      body: { action },
    });
  },
  listReports(token: string, params?: { report_type?: string }) {
    const search = new URLSearchParams();
    if (params?.report_type) search.set("report_type", params.report_type);
    return request<Report[]>(`/reports${search.size ? `?${search.toString()}` : ""}`, { token });
  },
  createReport(token: string, body: Record<string, unknown>) {
    return request<Report>("/reports", { method: "POST", token, body });
  },
  exportReport(token: string, reportId: string, exportFormat: "pdf" | "csv") {
    return request<{ filename: string; content: string; watermark: string }>(
      `/reports/${reportId}/export/${exportFormat}`,
      { method: "POST", token },
    );
  },
};
