import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser } from '../services/api';
import { UserRole } from '@vflow/shared';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
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

  const login = async (email: string, password: string = 'VFlow@123') => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('vflow_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vflow_token');
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
