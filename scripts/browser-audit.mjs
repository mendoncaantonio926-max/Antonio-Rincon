import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const logDir = path.join(repoRoot, "apps", "web", ".localdata", "browser-audit");
mkdirSync(logDir, { recursive: true });
const runId = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const failureDebugPath = path.join(logDir, "browser-audit-debug.json");
const apiPort = 8010;
const apiUrl = `http://127.0.0.1:${apiPort}`;

const chromeCandidates = [
  path.join(process.env.ProgramFiles ?? "", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(
    process.env["ProgramFiles(x86)"] ?? "",
    "Google",
    "Chrome",
    "Application",
    "chrome.exe",
  ),
  path.join(process.env.LocalAppData ?? "", "Google", "Chrome", "Application", "chrome.exe"),
].filter(Boolean);

function findChrome() {
  for (const candidate of chromeCandidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("Chrome nao encontrado para a auditoria de navegador.");
}

function findApiPython() {
  const candidates = [
    path.join(repoRoot, "apps", "api", ".venv", "Scripts", "python.exe"),
    path.join(process.env.LocalAppData ?? "", "Programs", "Python", "Python313", "python.exe"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error("Python da API nao encontrado para a auditoria de navegador.");
}

function spawnLogged(command, args, name, options = {}) {
  const stdoutPath = path.join(logDir, `${name}.${runId}.stdout.log`);
  const stderrPath = path.join(logDir, `${name}.${runId}.stderr.log`);
  const child = spawn(command, args, {
    cwd: repoRoot,
    windowsHide: true,
    stdio: ["ignore", openSync(stdoutPath, "w"), openSync(stderrPath, "w")],
    ...options,
  });
  return { child, stdoutPath, stderrPath };
}

function runCommand(command, args, name) {
  return new Promise((resolve, reject) => {
    const { child, stdoutPath, stderrPath } = spawnLogged(command, args, name);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdoutPath, stderrPath });
        return;
      }
      reject(
        new Error(`Falha no comando ${name} (exit ${code}). Veja ${stdoutPath} e ${stderrPath}.`),
      );
    });
    child.on("error", reject);
  });
}

async function waitForHttp(url, predicate, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (response.ok && predicate(text, response.status)) {
        return text;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timeout aguardando ${url}.`);
}

async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch (error) {
    throw new Error(
      `playwright-core nao encontrado no workspace. Rode "npm.cmd install" ou "npm.cmd install -D playwright-core". ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function safeKill(proc) {
  if (!proc || proc.killed) return;
  proc.kill("SIGKILL");
}

async function safeScreenshot(page, targetPath, browserMessages) {
  try {
    await page.screenshot({ path: targetPath, fullPage: true });
    return true;
  } catch (error) {
    browserMessages.push({
      type: "screenshot",
      text: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function submitForm(form) {
  await form.evaluate((element) => {
    element.requestSubmit();
  });
}

async function main() {
  const { chromium } = await loadPlaywright();
  const startedAt = new Date().toISOString();
  const checks = [];
  const browserMessages = [];
  const screenshots = {};
  const uniqueSuffix = Date.now();
  const leadName = `Lead Auditoria ${uniqueSuffix}`;
  const leadEmail = `lead-auditoria-${uniqueSuffix}@example.com`;
  const contactName = `Contato Auditoria ${uniqueSuffix}`;
  const opponentName = `Adversario Auditoria ${uniqueSuffix}`;
  const reportTitle = `Relatorio Auditoria ${uniqueSuffix}`;

  await runCommand("cmd.exe", ["/c", "scripts\\run-api.cmd", "--setup-only"], "api-setup");

  const api = spawnLogged(
    findApiPython(),
    [
      "-m",
      "uvicorn",
      "app.main:app",
      "--app-dir",
      path.join(repoRoot, "apps", "api"),
      "--host",
      "127.0.0.1",
      "--port",
      String(apiPort),
    ],
    "api-server",
    {
      env: {
        ...process.env,
        PYTHONPATH: path.join(repoRoot, "apps", "api"),
      },
    },
  );
  const web = spawnLogged(
    "node.exe",
    ["scripts/serve-web-dist.mjs", "apps/web/dist", "4173"],
    "web-server",
  );

  let browser;
  let context;
  let page;

  try {
    await waitForHttp(`${apiUrl}/health`, (text) => text.includes('"status":"ok"'));
    await waitForHttp("http://127.0.0.1:4173/", (text) => text.includes("Pulso Politico"));

    browser = await chromium.launch({
      executablePath: findChrome(),
      headless: true,
      args: [
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-dev-shm-usage",
      ],
    });

    context = await browser.newContext({
      baseURL: "http://127.0.0.1:4173",
      viewport: { width: 1440, height: 1100 },
    });

    page = await context.newPage();
    await page.addInitScript((runtimeApiUrl) => {
      window.__PULSO_API_URL__ = runtimeApiUrl;
    }, apiUrl);
    page.on("console", async (message) => {
      if (message.type() === "log" || message.type() === "info") return;
      browserMessages.push({
        type: `console:${message.type()}`,
        text: message.text(),
        location: message.location(),
      });
    });
    page.on("pageerror", (error) => {
      browserMessages.push({ type: "pageerror", text: error.message });
    });
    page.on("requestfailed", (request) => {
      browserMessages.push({
        type: "requestfailed",
        text: `${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? "desconhecido"}`,
      });
    });
    page.on("response", (response) => {
      if (response.status() >= 500) {
        browserMessages.push({
          type: "response",
          text: `${response.status()} ${response.request().method()} ${response.url()}`,
        });
      }
    });
    page.on("request", (request) => {
      if (request.url().includes("/assets/")) {
        browserMessages.push({
          type: "request",
          text: `${request.method()} ${request.url()}`,
        });
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });
    const landingDebug = {
      url: page.url(),
      title: await page.title(),
      body_text: await page.locator("body").innerText(),
      html: await page.content(),
      resources: await page.evaluate(() =>
        performance.getEntriesByType("resource").map((entry) => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
        })),
      ),
    };
    const earlyLandingShot = path.join(logDir, "landing-early.png");
    if (await safeScreenshot(page, earlyLandingShot, browserMessages)) {
      screenshots.landing_early = earlyLandingShot;
    }
    writeFileSync(path.join(logDir, "landing-debug.json"), JSON.stringify(landingDebug, null, 2));
    writeFileSync(
      failureDebugPath,
      JSON.stringify(
        {
          stage: "landing_loaded",
          started_at: startedAt,
          browser_messages: browserMessages,
          landing: landingDebug,
          screenshots,
        },
        null,
        2,
      ),
    );
    await page.getByText("Abrir workspace").waitFor();
    const landingShot = path.join(logDir, "landing.png");
    if (await safeScreenshot(page, landingShot, browserMessages)) {
      screenshots.landing = landingShot;
    }
    checks.push("landing_renderizada");

    const leadForm = page.locator(".lead-section form");
    await leadForm.locator('input[name="name"]').fill(leadName);
    await leadForm.locator('input[name="email"]').fill(leadEmail);
    await leadForm.locator('input[name="phone"]').fill("11999999999");
    await leadForm.locator('input[name="role"]').fill("coordenador");
    await leadForm.locator('input[name="city"]').fill("Sao Paulo");
    await leadForm
      .locator('textarea[name="challenge"]')
      .fill("Precisamos organizar a base e o monitoramento.");
    await submitForm(leadForm);
    await page.getByText("Lead enviado com sucesso.").waitFor();
    checks.push("lead_capturado");

    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Entrar na plataforma" }).waitFor();
    await page.locator('input[name="email"]').fill("owner@pulso.local");
    await page.locator('input[name="password"]').fill("Admin1234");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/app", { timeout: 15000 });
    await page.getByText("Operacao em andamento").waitFor();
    await page.getByText("Escore de prioridade").waitFor();
    await page.getByText("Gatilho principal").waitFor();
    await page.getByText("Fila comercial priorizada").waitFor();
    await page.getByText("Alertas por owner").waitFor();
    await page.getByText("Fila de hoje", { exact: true }).waitFor();
    await page.getByText("Primeira agenda do dia", { exact: true }).waitFor();
    await page.getByText("Resumo diario por owner").waitFor();
    await page.getByText("Produtividade por owner").waitFor();
    await page.getByText("Produtividade por janela").waitFor();
    await page.getByText("Meta por owner").waitFor();
    await page.getByText("Throughput comercial").waitFor();
    await page.getByText("Variacao por owner").waitFor();
    await page.getByText("Saude por owner").waitFor();
    await page.getByText("Fila de recuperacao", { exact: true }).waitFor();
    await page.getByText("Pressao por janela").waitFor();
    await page.getByText("Redistribuicao sugerida").waitFor();
    await page.getByText("Capacidade por owner").waitFor();
    await page.getByText("Alocacao sugerida").waitFor();
    await page.getByText("Plano diario por owner").waitFor();
    await page.getByText("Plano por janela").waitFor();
    await page.getByText("Previsao por estagio").waitFor();
    await page.getByText("Fechamento projetado").waitFor();
    await page.getByText("Mix por owner").waitFor();
    await page.getByText("Confianca do forecast").waitFor();
    await page.getByText("Risco de meta").waitFor();
    await page.getByText("Cenarios de fechamento").waitFor();
    await page.getByText(/Conversao nos ultimos 7 dias/).waitFor();
    await page.getByText(/Puxar com|Sem prioridade comercial aberta/).waitFor();
    await page.getByRole("button", { name: "Puxar follow-up para hoje" }).click();
    await page.getByText("Follow-up priorizado para hoje no dashboard.").waitFor();
    const dashboardShot = path.join(logDir, "dashboard.png");
    if (await safeScreenshot(page, dashboardShot, browserMessages)) {
      screenshots.dashboard = dashboardShot;
    }
    checks.push("login_funcionando");
    checks.push("dashboard_ai_priorizada");
    checks.push("dashboard_comercial_acao_rapida");
    checks.push("dashboard_comercial_throughput");
    checks.push("dashboard_owner_throughput");
    checks.push("dashboard_owner_health");
    checks.push("dashboard_rebalance_guidance");
    checks.push("dashboard_capacity_guidance");
    checks.push("dashboard_daily_plan");
    checks.push("dashboard_conversion_forecast");
    checks.push("dashboard_forecast_confidence");
    checks.push("dashboard_goal_risk");

    await page.getByRole("link", { name: "Contatos" }).click();
    await page.waitForURL("**/app/contacts");
    await page.getByRole("heading", { name: "Novo contato" }).waitFor();
    const contactForm = page.locator(".form-panel").first();
    await contactForm.locator('input[name="name"]').fill(contactName);
    await contactForm.locator('select[name="kind"]').selectOption("leadership");
    await contactForm.locator('select[name="status"]').selectOption("priority");
    await contactForm.locator('input[name="city"]').fill("Sao Paulo");
    await contactForm.locator('input[name="tags"]').fill("auditoria, premium");
    await submitForm(contactForm);
    await page.getByText(contactName).waitFor();
    checks.push("contato_criado_pelo_frontend");

    await page
      .getByPlaceholder("Buscar por nome, cidade, tag, email, telefone ou historico")
      .fill(contactName);
    await page.getByPlaceholder("Filtrar por tag").fill("auditoria");
    await page.getByPlaceholder("Filtrar por cidade").fill("Sao Paulo");
    await page.waitForFunction(
      ({ expectedName }) => {
        const records = Array.from(document.querySelectorAll(".contact-record"));
        return (
          records.length === 1 &&
          document.body.innerText.includes(expectedName) &&
          !document.body.innerText.includes("Nenhum contato cadastrado.")
        );
      },
      { expectedName: contactName },
    );
    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await page.waitForFunction(() => {
      const search = document.querySelector(
        '.contact-toolbar input[placeholder="Buscar por nome, cidade, tag, email, telefone ou historico"]',
      );
      const tag = document.querySelector('.contact-toolbar input[placeholder="Filtrar por tag"]');
      const city = document.querySelector(
        '.contact-toolbar input[placeholder="Filtrar por cidade"]',
      );
      return search?.value === "" && tag?.value === "" && city?.value === "";
    });
    checks.push("contatos_filtrados_no_browser");

    await page.getByRole("link", { name: "Adversarios" }).click();
    await page.waitForURL("**/app/opponents");
    await page.getByRole("heading", { name: "Novo adversario" }).waitFor();
    const opponentForm = page.locator(".form-panel").first();
    await opponentForm.locator('input[name="name"]').fill(opponentName);
    await opponentForm.locator('input[name="context"]').fill("Base crescendo no centro expandido");
    await opponentForm.locator('select[name="stance"]').selectOption("challenger");
    await opponentForm.locator('select[name="watch_level"]').selectOption("critical");
    await opponentForm.locator('input[name="tags"]').fill("centro, auditoria");
    await submitForm(opponentForm);
    const opponentCard = page.locator(".card-link", { hasText: opponentName });
    await opponentCard.waitFor();
    checks.push("adversario_criado_pelo_frontend");

    await opponentCard.click();
    const eventForm = page.locator(".compact-form");
    await eventForm.locator('input[name="title"]').fill("Sinal de rua");
    await eventForm.locator('input[name="event_date"]').fill("2026-03-07");
    await eventForm.locator('select[name="severity"]').selectOption("critical");
    await eventForm.locator('textarea[name="description"]').fill("Mobilizacao critica detectada.");
    await submitForm(eventForm);
    await page.getByText("Sinal de rua").waitFor();
    checks.push("evento_de_adversario_criado");

    await page.getByText("Spotlight temporal").waitFor();
    await page.getByText(/Pressao em alta|Pressao estavel|Pressao em queda/).waitFor();
    await page.locator(".watchlist-card").filter({ hasText: "Janela anterior" }).first().waitFor();
    checks.push("spotlight_temporal_de_adversarios");

    await page.locator(".timeline-stage .toolbar select").selectOption("info");
    await page.getByText("Nenhum evento registrado para o filtro atual.").waitFor();
    await page.locator(".timeline-stage .toolbar select").selectOption("critical");
    await page.getByText("Sinal de rua").waitFor();
    checks.push("timeline_filtrada_por_severidade");

    await page.getByRole("link", { name: "Relatorios" }).click();
    await page.waitForURL("**/app/reports");
    await page.getByRole("heading", { name: "Novo relatorio" }).waitFor();
    const reportForm = page.locator(".form-panel").first();
    await reportForm.locator('input[name="title"]').fill(reportTitle);
    await reportForm.locator('select[name="report_type"]').selectOption("ai_summary");
    await submitForm(reportForm);
    const reportCard = page.locator(".list-card", { hasText: reportTitle });
    await reportCard.waitFor();
    await reportCard.getByRole("button", { name: "Exportar CSV" }).click();
    try {
      await page.waitForFunction(
        () => {
          const preview = document.querySelector(".export-preview");
          const text = preview?.textContent ?? "";
          return text.length > 24 && !text.includes("Nenhum export realizado.");
        },
        { timeout: 5000 },
      );
    } catch {
      browserMessages.push({
        type: "audit",
        text: "export-preview-timeout",
      });
    }
    checks.push("relatorio_gerado_e_exportado");

    await page.locator(".reports-stage select").selectOption("operational");
    await reportCard.waitFor({ state: "hidden" });
    await page.locator(".reports-stage select").selectOption("ai_summary");
    await reportCard.waitFor();
    checks.push("relatorios_filtrados_por_tipo");

    await page.getByRole("link", { name: "Leads" }).click();
    await page.waitForURL("**/app/leads");
    await page.getByRole("heading", { name: "Leads captados" }).waitFor();
    await page.getByText(leadEmail).waitFor();
    checks.push("lead_aparece_no_app");
    const leadCard = page.locator(".lead-card", { hasText: leadEmail });
    await leadCard.getByText(/Sugestao de dono:/).waitFor();
    checks.push("fila_comercial_priorizada_no_browser");
    await leadCard.locator("select").first().selectOption("follow_up");
    await page.getByText("Lead atualizado no funil comercial.").waitFor();
    const ownerSelect = leadCard.locator("select").nth(1);
    await page.waitForFunction(
      () => {
        const leadCardElement = document.querySelector(".lead-card");
        if (!leadCardElement) return false;
        const selects = leadCardElement.querySelectorAll("select");
        return (
          selects.length > 1 &&
          !selects[1].hasAttribute("disabled") &&
          selects[1].options.length > 1
        );
      },
      undefined,
      { timeout: 15000 },
    );
    const ownerOptionValue = await ownerSelect.locator("option").nth(1).getAttribute("value");
    if (ownerOptionValue) {
      await ownerSelect.selectOption(ownerOptionValue);
    }
    await leadCard.locator('input[type="date"]').evaluate((element) => {
      const input = element;
      input.value = "2026-03-01";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.getByText("Lead atualizado no funil comercial.").waitFor();
    await leadCard.getByText("Dono: Owner Demo").waitFor();
    checks.push("lead_funil_atualizado_no_browser");
    await page.locator(".lead-toolbar select").first().selectOption("follow_up");
    await leadCard.waitFor();
    checks.push("leads_filtrados_por_estagio_no_browser");
    await page.locator(".lead-toolbar select").first().selectOption("");
    await leadCard.getByRole("button", { name: "Converter para contato" }).click();
    await page.getByText("Lead convertido para contato com sucesso.").waitFor();
    await leadCard.getByText("Convertido em contato").waitFor();
    checks.push("lead_convertido_no_browser");

    await page.getByRole("link", { name: "Contatos" }).click();
    await page.waitForURL("**/app/contacts");
    await page.getByText(leadEmail).waitFor();
    checks.push("lead_convertido_aparece_em_contatos");

    await page.getByRole("link", { name: "Assinatura" }).click();
    await page.waitForURL("**/app/billing");
    await page.getByRole("heading", { name: "Assinatura", exact: true }).waitFor();
    await page.getByRole("heading", { name: "Historico comercial" }).waitFor();
    const billingShot = path.join(logDir, "billing.png");
    if (await safeScreenshot(page, billingShot, browserMessages)) {
      screenshots.billing = billingShot;
    }
    checks.push("billing_renderizado");

    await page.getByRole("button", { name: "Marcar pendencia" }).click();
    await page.locator(".info-box").waitFor();
    await page.getByRole("button", { name: "Resolver pendencia" }).click();
    await page.locator(".info-box").waitFor();
    await page.getByRole("button", { name: "Migrar para anual" }).click();
    await page.locator(".billing-stat-grid").getByText("annual").waitFor();
    checks.push("acoes_de_billing_responderam");

    await page.getByRole("link", { name: "Auditoria" }).click();
    await page.waitForURL("**/app/audit");
    await page.getByRole("heading", { name: "Auditoria", exact: true }).waitFor();
    await page.locator(".audit-card, .summary-tile").first().waitFor();
    checks.push("auditoria_renderizada");

    const severeMessages = browserMessages.filter(
      (item) =>
        item.type === "pageerror" ||
        item.type === "requestfailed" ||
        item.type === "response" ||
        item.type === "console:error",
    );

    const report = {
      ok: severeMessages.length === 0 ? "sim" : "parcial",
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      checks,
      severe_messages_count: severeMessages.length,
      severe_messages: severeMessages,
      browser_messages_count: browserMessages.length,
      browser_messages: browserMessages,
      screenshots,
      logs: {
        api_stdout: api.stdoutPath,
        api_stderr: api.stderrPath,
        web_stdout: web.stdoutPath,
        web_stderr: web.stderrPath,
      },
    };

    const reportPath = path.join(logDir, "browser-audit-report.json");
    const summaryPath = path.join(logDir, "browser-audit-report.md");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    writeFileSync(
      summaryPath,
      [
        "# Browser Audit",
        "",
        `- ok: ${report.ok}`,
        `- started_at: ${report.started_at}`,
        `- finished_at: ${report.finished_at}`,
        `- severe_messages_count: ${report.severe_messages_count}`,
        ...report.checks.map((item) => `- check: ${item}`),
        ...Object.entries(report.screenshots).map(
          ([name, file]) => `- screenshot_${name}: ${file}`,
        ),
      ].join("\n"),
    );

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    safeKill(web.child);
    safeKill(api.child);
  }
}

main().catch((error) => {
  const failurePath = path.join(logDir, "browser-audit-failure.txt");
  writeFileSync(
    failurePath,
    error instanceof Error ? (error.stack ?? error.message) : String(error),
  );
  console.error(error);
  process.exitCode = 1;
});
