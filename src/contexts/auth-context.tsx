import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { authService, type AuthUser } from '@/services/auth.service';

const TOKEN_KEY = 'remindme.access-token';
let webSessionToken: string | null = null;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readToken(): Promise<string | null> {
  if (Platform.OS === 'web') return webSessionToken;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSessionToken = token;
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    webSessionToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const storedToken = await readToken();
        if (!storedToken) return;
        const response = await authService.me(storedToken);
        if (active) {
          setToken(storedToken);
          setUser(response.user);
        }
      } catch {
        await removeToken();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    const response = await authService.login(email.trim(), password);
    await saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    const response = await authService.register(name.trim(), email.trim(), password);
    await saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = useMemo(() => ({
    user, token, loading, error, login, register, logout,
    clearError: () => setError(null),
  }), [user, token, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}
