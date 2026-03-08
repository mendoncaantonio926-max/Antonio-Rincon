import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@pulso/ui";
import { useAuth } from "./auth";

type Mode = "login" | "register";

export function AuthPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(
          String(formData.get("full_name") ?? ""),
          email,
          password,
          String(formData.get("tenant_name") ?? ""),
        );
      }
      navigate("/app");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha inesperada.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-stage">
        <div className="auth-aside">
          <p className="eyebrow">Pulso Politico</p>
          <h1>{mode === "login" ? "Entre na sala de comando da operacao." : "Crie um workspace com presenca de produto real."}</h1>
          <p className="auth-copy">
            {mode === "login"
              ? "Acesse contatos, monitoramento, relatorios, billing e dashboard com leitura executiva unica."
              : "Abra a operacao inicial com identidade propria, trilha de onboarding e base pronta para campanha e mandato."}
          </p>
          <div className="auth-benefits">
            <span>CRM politico com historico</span>
            <span>Timeline de adversarios e watchlist</span>
            <span>IA com proxima acao recomendada</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <Card
            className="auth-card"
            eyebrow={mode === "login" ? "Acesso seguro" : "Ativacao inicial"}
            title={mode === "login" ? "Entrar na plataforma" : "Criar workspace"}
          >
            <p className="auth-copy">
              {mode === "login"
                ? "Use sua conta para acessar o workspace."
                : "Crie sua conta inicial e o tenant principal da operacao."}
            </p>

            {mode === "register" ? (
              <>
                <Input label="Nome completo" name="full_name" required minLength={3} autoComplete="name" />
                <Input label="Nome do workspace" name="tenant_name" required minLength={3} autoComplete="organization" />
              </>
            ) : null}

            <Input label="Email" name="email" type="email" required autoComplete="email" />
            <Input
              label="Senha"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {error ? <div className="error-box">{error}</div> : null}

            <Button
              label={pending ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
              type="submit"
              disabled={pending}
            />

            <p className="auth-switch">
              {mode === "login" ? "Ainda nao tem conta?" : "Ja tem conta?"}{" "}
              <Link to={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Criar agora" : "Entrar"}
              </Link>
            </p>
          </Card>
        </form>
      </section>
    </main>
  );
}
