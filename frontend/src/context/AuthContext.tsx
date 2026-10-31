import { createContext, useContext, useState, type ReactNode } from "react";
import * as api from "../api/client";

type AuthUser = { username: string; displayName: string };

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = "authUser";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  async function signIn(username: string, password: string) {
    const { token, user: loggedInUser } = await api.login(username, password);
    localStorage.setItem("authToken", token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function signOut() {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem(STORAGE_USER_KEY);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
