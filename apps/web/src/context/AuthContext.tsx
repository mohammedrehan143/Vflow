import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser } from '../services/api';
import { UserRole } from '@vflow/shared';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<any>;
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

  const login = async (email: string, password: string = 'VFlow@123', remember: boolean = true) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        if (remember) {
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

  const selectRole = async (targetRole: 'customer' | 'provider') => {
    setIsLoading(true);
    try {
      const res = await api.auth.selectRole(targetRole);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      api.auth.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('vflow_token');
    sessionStorage.removeItem('vflow_token');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (targetRole: 'customer' | 'provider' | 'admin') => {
    const roleEmails = {
      customer: 'driver@vflow.in',
      provider: 'provider@vflow.in',
      admin: 'admin@vflow.in',
    };
    await login(roleEmails[targetRole], 'VFlow@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
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
