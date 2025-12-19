'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  demo: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage or sessionStorage
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (storedToken) {
      // Check if token has expired (for remember me tokens)
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        if (expiryDate < new Date()) {
          // Token expired, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          sessionStorage.removeItem('token');
          setLoading(false);
          return;
        }
      }
      
      setToken(storedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { user } = await authAPI.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const { user, token } = await authAPI.login(email, password);
    
    if (rememberMe) {
      // Save to localStorage with 30 days expiration
      localStorage.setItem('token', token);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());
    } else {
      // Save to sessionStorage (cleared when browser closes)
      sessionStorage.setItem('token', token);
      // Remove any existing localStorage token
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
    
    setToken(token);
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const { user, token } = await authAPI.register(email, password, name);
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const demo = async () => {
    const { user, token } = await authAPI.demo();
    sessionStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    // Don't clear remembered credentials on logout - user might want to stay logged in
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, demo, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
