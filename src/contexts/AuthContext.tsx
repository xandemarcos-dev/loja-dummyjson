import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LoginFormValues, User } from '../schemas/auth';
import { fetchCurrentUser, login as loginRequest } from '../services/authService';
import { TOKEN_KEY, tokenStorage } from '../services/tokenStorage';
import { UNAUTHORIZED_EVENT } from '../services/api';

/** checking = há token salvo e ainda estamos validando com GET /auth/me */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (credentials: LoginFormValues) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'checking' : 'anonymous'));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const login = useCallback(async (credentials: LoginFormValues) => {
    const response = await loginRequest(credentials);
    const { accessToken, ...rest } = response;
    const loggedUser: User = {
      id: rest.id,
      username: rest.username,
      email: rest.email,
      firstName: rest.firstName,
      lastName: rest.lastName,
      image: rest.image,
    };
    tokenStorage.set(accessToken);
    setToken(accessToken);
    setUser(loggedUser);
    setStatus('authenticated');
    return loggedUser;
  }, []);

  // Ao abrir a aplicação com um token salvo, confirma com a API se ele ainda vale.
  // Depende só de `token`; o AbortController cancela a requisição se o token mudar
  // (ex.: logout) ou o provider desmontar antes da resposta.
  useEffect(() => {
    if (!token || user) return;

    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === 'CanceledError') return;
        logout();
      });

    return () => controller.abort();
  }, [token, user, logout]);

  // Ouvintes globais: 401 vindo do interceptor e logout/login feito em outra aba.
  useEffect(() => {
    const handleUnauthorized = () => logout();
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;
      if (event.newValue === null) {
        logout();
      } else {
        setUser(null);
        setStatus('checking');
        setToken(event.newValue);
      }
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener('storage', handleStorage);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, status, isAuthenticated: status === 'authenticated', login, logout }),
    [user, token, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
