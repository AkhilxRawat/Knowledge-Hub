"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import * as api from "@/lib/api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  signup(name: string, email: string, password: string): Promise<void>;
  logout(): void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  const persist = (token: string, u: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  return (
    <Ctx.Provider value={{
      user, loading,
      login:  async (email, password) => { const r = await api.login(email, password);       persist(r.token, r.user); },
      signup: async (name, email, password) => { const r = await api.signup(name, email, password); persist(r.token, r.user); },
      logout: () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
};
