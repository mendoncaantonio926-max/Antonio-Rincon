import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, AuthResponse } from "./api";

type AuthState = {
  tokens: AuthResponse["tokens"] | null;
  user: AuthResponse["user"] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, tenantName: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "pulso-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthResponse["tokens"] | null>(null);
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { tokens: AuthResponse["tokens"]; user: AuthResponse["user"] };
      setTokens(parsed.tokens);
      setUser(parsed.user);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const persistAuth = (response: AuthResponse) => {
    setTokens(response.tokens);
    setUser(response.user);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
  };

  const value = useMemo<AuthState>(
    () => ({
      tokens,
      user,
      loading,
      async login(email: string, password: string) {
        const response = await api.login(email, password);
        persistAuth(response);
      },
      async register(fullName: string, email: string, password: string, tenantName: string) {
        const response = await api.register(fullName, email, password, tenantName);
        persistAuth(response);
      },
      logout() {
        setTokens(null);
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [loading, tokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
