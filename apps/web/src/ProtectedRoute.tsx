import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { loading, tokens } = useAuth();

  if (loading) {
    return <div className="center-panel">Carregando sessao...</div>;
  }

  if (!tokens?.access_token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
