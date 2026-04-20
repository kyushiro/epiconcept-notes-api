import React, { createContext, useCallback, useContext, useState } from 'react';
import * as authApi from '../api/auth.api';
import type { User, LoginInput, RegisterInput } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readFromStorage(): { user: User | null; token: string | null; tenantId: string | null } {
  try {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');
    const userJson = localStorage.getItem('user');
    const user = userJson ? (JSON.parse(userJson) as User) : null;
    return { token, tenantId, user };
  } catch {
    return { token: null, tenantId: null, user: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = readFromStorage();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [tenantId, setTenantId] = useState<string | null>(stored.tenantId);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authApi.login(input);
    localStorage.setItem('token', result.accessToken);
    localStorage.setItem('tenant_id', input.tenantId);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.accessToken);
    setTenantId(input.tenantId);
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input);
    localStorage.setItem('token', result.accessToken);
    localStorage.setItem('tenant_id', input.tenantId);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.accessToken);
    setTenantId(input.tenantId);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user');
    setToken(null);
    setTenantId(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, tenantId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
