import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";

const navigateMock = vi.fn();
const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("./auth", () => ({
  useAuth: () => ({
    login: loginMock,
    register: registerMock,
  }),
}));

describe("AuthPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it("submete login e navega para o app", async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthPage mode="login" />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "owner@pulso.local");
    await user.type(screen.getByLabelText("Senha"), "Admin1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("owner@pulso.local", "Admin1234");
      expect(navigateMock).toHaveBeenCalledWith("/app");
    });
  });

  it("submete registro com dados completos do workspace", async () => {
    registerMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthPage mode="register" />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Nome completo"), "Antonio Rincon");
    await user.type(screen.getByLabelText("Nome do workspace"), "Pulso Centro");
    await user.type(screen.getByLabelText("Email"), "antonio@pulso.local");
    await user.type(screen.getByLabelText("Senha"), "Admin1234");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith(
        "Antonio Rincon",
        "antonio@pulso.local",
        "Admin1234",
        "Pulso Centro",
      );
      expect(navigateMock).toHaveBeenCalledWith("/app");
    });
  });

  it("mostra erro quando a autenticacao falha", async () => {
    loginMock.mockRejectedValue(new Error("Credenciais invalidas"));
    const user = userEvent.setup();

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthPage mode="login" />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "owner@pulso.local");
    await user.type(screen.getByLabelText("Senha"), "senha-invalida");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciais invalidas")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
