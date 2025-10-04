'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi, XanoApiError } from './api';
import type { User, LoginCredentials, RegisterCredentials } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management
const TOKEN_KEY = 'xano_token';
const REFRESH_TOKEN_KEY = 'xano_refresh_token';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setStoredRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearStoredTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  console.log('AuthProvider rendering', { isLoading, hasUser: !!user, hasToken: !!token });

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    console.log('Auth initialization effect running');

    async function initAuth() {
      const forceStopTimeout = setTimeout(() => {
        if (mounted) {
          console.log('Force stopping loading state after timeout');
          setIsLoading(false);
          clearStoredTokens();
        }
      }, 5000);

      try {
        const storedToken = getStoredToken();
        console.log('Auth check - stored token exists:', !!storedToken);
        
        if (!storedToken) {
          if (mounted) {
            console.log('No stored token found, setting unauthenticated state');
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        // Check if API key is configured
        if (!process.env.NEXT_PUBLIC_XANO_API_KEY) {
          console.warn('Xano API key not configured');
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        try {
          const userData = await authApi.getMe(storedToken);
          console.log('User data fetch result:', !!userData);
          
          if (mounted && userData) {
            setUser(userData);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Auth error:', error);
          clearStoredTokens();
          if (mounted) {
            setUser(null);
            setToken(null);
          }
          throw error; // Re-throw to be caught by outer try-catch
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          clearStoredTokens();
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
      } finally {
        clearTimeout(forceStopTimeout);
        if (mounted) {
          console.log('Setting loading to false');
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);


  const login = useCallback(async (credentials: LoginCredentials) => {
    if (!process.env.NEXT_PUBLIC_XANO_API_KEY) {
      throw new Error('Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.');
    }

    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);
      setStoredToken(response.token);
      
      if (response.refresh_token) {
        setStoredRefreshToken(response.refresh_token);
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [router]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    if (!process.env.NEXT_PUBLIC_XANO_API_KEY) {
      throw new Error('Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.');
    }

    try {
      const response = await authApi.register(credentials);
      setUser(response.user);
      setToken(response.token);
      setStoredToken(response.token);
      
      if (response.refresh_token) {
        setStoredRefreshToken(response.refresh_token);
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      clearStoredTokens();
      router.push('/');
    }
  }, [router]);


  const updateProfile = useCallback(async (data: Partial<User>) => {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated');
    
    try {
      const updatedUser = await usersApi.updateProfile(token, data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
