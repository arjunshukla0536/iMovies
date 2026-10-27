import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('imovies_token'));
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      const savedToken = localStorage.getItem('imovies_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          // Token invalid or expired
          localStorage.removeItem('imovies_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Automatically pre-log in as demo user for immediate seamless experience!
        try {
          const res = await api.login('alex@cinephile.com', 'User@123');
          localStorage.setItem('imovies_token', res.token);
          setToken(res.token);
          setUser(res.user);
        } catch {
          // Ignore
        }
      }
      setLoading(false);
    }
    loadCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('imovies_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setShowAuthModal(false);
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    const res = await api.register(payload);
    localStorage.setItem('imovies_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: UserRole) => {
    if (role === 'admin') {
      await login('admin@imovies.cinema', 'Admin@123');
    } else {
      await login('alex@cinephile.com', 'User@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        showAuthModal,
        setShowAuthModal,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
