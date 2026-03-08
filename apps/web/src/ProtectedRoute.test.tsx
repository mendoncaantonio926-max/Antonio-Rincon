import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

const authState = {
  loading: false,
  tokens: null as null | { access_token: string },
};

vi.mock("./auth", () => ({
  useAuth: () => authState,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState.loading = false;
    authState.tokens = null;
  });

  it("mostra estado de carregamento enquanto a sessao e resolvida", () => {
    authState.loading = true;

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={["/app"]}
      >
        <ProtectedRoute>
          <div>Conteudo privado</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Carregando sessao...")).toBeInTheDocument();
  });

  it("redireciona para login quando nao ha token", () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={["/privado"]}
      >
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <div>Conteudo privado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renderiza o conteudo protegido quando a sessao esta ativa", () => {
    authState.tokens = { access_token: "token-valido" };

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProtectedRoute>
          <div>Conteudo privado</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Conteudo privado")).toBeInTheDocument();
  });
});
