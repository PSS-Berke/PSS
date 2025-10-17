'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, companyApi, usersApi, XanoApiError } from './api';
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
  switchCompany: (companyId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  authenticateWithToken: (token: string) => Promise<void>;
  onboardCompany: (data: { company: string; company_code?: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management with cookies (primary) and localStorage (fallback)
const TOKEN_KEY = 'xano_token';
const REFRESH_TOKEN_KEY = 'xano_refresh_token';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Try cookies first
  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  // Fallback to localStorage
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  // Store in both cookies and localStorage for maximum compatibility
  const isSecure = window.location.protocol === 'https:';
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for mobile compatibility
    secure: isSecure, // Only use secure flag on HTTPS
    path: '/' // Explicit path to ensure cookie works across all routes
  });
  localStorage.setItem(TOKEN_KEY, token);
};

const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Try cookies first
  const cookieToken = Cookies.get(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken;
  // Fallback to localStorage
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setStoredRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  // Store in both cookies and localStorage
  const isSecure = window.location.protocol === 'https:';
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: 30,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for mobile compatibility
    secure: isSecure, // Only use secure flag on HTTPS
    path: '/' // Explicit path to ensure cookie works across all routes
  });
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearStoredTokens = (): void => {
  if (typeof window === 'undefined') return;
  // Clear both cookies and localStorage
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
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

      // Navigation is handled by the signin page to support redirect param
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    if (!process.env.NEXT_PUBLIC_XANO_API_KEY) {
      throw new Error('Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.');
    }

    try {
      const response = await authApi.register(credentials);
      // Don't set user/token or redirect - user needs to verify email first
      // Navigation is handled by the signup page
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

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


  const authenticateWithToken = useCallback(async (incomingToken: string) => {
    try {
      setStoredToken(incomingToken);
      setToken(incomingToken);
      // Best effort fetch of user profile
      const userData = await authApi.getMe(incomingToken);
      setUser(userData);
    } catch (error) {
      console.error('authenticateWithToken failed:', error);
      // still keep token so app can proceed; user can be fetched later
    }
  }, []);

  const onboardCompany = useCallback(async (data: { company: string; company_code?: number }) => {
    const storedToken: string = getStoredToken() as string;
    if (!storedToken) throw new Error('Not authenticated');
    try {
      const company = await companyApi.createCompany(storedToken, { company_name: data.company, company_code: data.company_code });
      console.log(company);
    } catch (error) {
      console.error('Onboarding failed:', error);
      throw error;
    }
  }, []);


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

  const refreshUser = useCallback(async () => {
    console.log('=== REFRESH USER START ===');
    const token = getStoredToken();
    if (!token) {
      console.error('❌ No token for refresh');
      throw new Error('Not authenticated');
    }

    try {
      console.log('Fetching user data from /auth/me...');
      const userData = await authApi.getMe(token);
      console.log('✅ User data fetched:', userData);
      console.log('Company ID in response:', userData?.company_id);
      console.log('Available companies in response:', userData?.available_companies);
      setUser(userData);
      console.log('✅ User state updated');
    } catch (error) {
      console.error('❌ Refresh user failed:', error);
      throw error;
    }
  }, []);

  const switchCompany = useCallback(async (companyId: number) => {
    console.log('=== AUTH CONTEXT: SWITCH COMPANY START ===');
    console.log('Current user:', user);
    console.log('Current company_id:', user?.company_id);
    console.log('Target company_id:', companyId);
    console.log('Available companies:', user?.available_companies);

    const token = getStoredToken();
    console.log('Token retrieved:', !!token);

    if (!token) {
      console.error('❌ No token available');
      throw new Error('Not authenticated');
    }

    try {
      console.log('Calling authApi.switchCompany...');
      await authApi.switchCompany(token, companyId);
      console.log('✅ authApi.switchCompany succeeded, now refreshing user...');

      await refreshUser();
      console.log('✅ refreshUser succeeded');
      console.log('Updated user:', user);
      console.log('Updated company_id:', user?.company_id);
    } catch (error) {
      console.error('❌ AUTH CONTEXT: Switch company failed');
      console.error('Error details:', error);
      throw error;
    }
  }, [refreshUser, user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    switchCompany,
    refreshUser,
    authenticateWithToken,
    onboardCompany,
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
