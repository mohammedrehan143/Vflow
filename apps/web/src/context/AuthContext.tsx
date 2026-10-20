import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser } from '../services/api';
import { UserRole } from '@vflow/shared';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    emailOrParams: string | { identifier?: string; email?: string; password?: string; remember?: boolean },
    password?: string,
    remember?: boolean
  ) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  selectRole: (role: 'customer' | 'provider') => Promise<void>;
  refreshUser: () => Promise<void>;
  quickDemoLogin: (targetRole: 'customer' | 'provider' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.auth.me();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out');
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (
    emailOrParams: string | { identifier?: string; email?: string; password?: string; remember?: boolean },
    password?: string,
    remember: boolean = true
  ) => {
    setIsLoading(true);
    let resolvedEmail = '';
    let resolvedPassword = password || 'VFlow@123';
    let resolvedRemember = remember;

    if (typeof emailOrParams === 'object' && emailOrParams !== null) {
      resolvedEmail = emailOrParams.identifier || emailOrParams.email || '';
      if (emailOrParams.password) resolvedPassword = emailOrParams.password;
      if (emailOrParams.remember !== undefined) resolvedRemember = emailOrParams.remember;
    } else {
      resolvedEmail = emailOrParams;
    }

    try {
      const res = await api.auth.login({ email: resolvedEmail, password: resolvedPassword });
      if (res.success && res.token) {
        if (resolvedRemember) {
          localStorage.setItem('vflow_token', res.token);
        } else {
          sessionStorage.setItem('vflow_token', res.token);
          localStorage.setItem('vflow_token', res.token);
        }
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('vflow_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vflow_token');
    sessionStorage.removeItem('vflow_token');
    setToken(null);
    setUser(null);
  };

  const selectRole = async (newRole: 'customer' | 'provider') => {
    if (!token) throw new Error('Not authenticated');
    const res = await api.auth.selectRole(newRole);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  // Instant 1-Click Demo Login bypass
  const quickDemoLogin = async (targetRole: 'customer' | 'provider' | 'admin') => {
    const email =
      targetRole === 'customer'
        ? 'customer@vflow.in'
        : targetRole === 'provider'
        ? 'provider@vflow.in'
        : 'admin@vflow.in';
    await login(email, 'VFlow@123', true);
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        selectRole,
        refreshUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
