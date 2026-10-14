import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setUnauthorizedHandler } from "@/services/api";
import { authService } from "@/services/authService";
import { toAppError } from "@/services/errors";
import { tokenStorage } from "@/services/tokenStorage";
import { userService } from "@/services/userService";
import type { User } from "@/types/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Restaura a sessão salva e confirma com a API que o token ainda vale.
  useEffect(() => {
    let active = true;

    (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await userService.getMe();
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
      } catch (error) {
        if (!active) return;
        if (toAppError(error).kind === "auth") {
          await tokenStorage.clear();
          setStatus("unauthenticated");
        } else {
          // Sem conexão: mantém a sessão; os dados serão buscados quando a API voltar.
          setStatus("authenticated");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    await tokenStorage.set(token, remember);
    setUser(loggedUser);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, setUser }),
    [status, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
