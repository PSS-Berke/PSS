'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { getAuthHeaders } from './config';

export interface CallPrepAnalysis {
  id: number;
  created_at: number;
  user_id: number;
  company_id: number;
  company_background: string;
  key_decision_makers: string;
  recent_news_initiatives: string;
  potential_pain_points: string;
  strategic_talking_points_for_sales_call: string;
  suggested_value_propositions: string;
  call_action_plan: string;
  preparation_tip: string;
}

interface CallPrepState {
  latestAnalysis: CallPrepAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
}

interface CallPrepContextValue {
  state: CallPrepState;
  generateCallPrep: (prompt: string) => Promise<void>;
  loadLatestAnalysis: () => Promise<void>;
}

const CallPrepContext = createContext<CallPrepContextValue | undefined>(undefined);

const GENERATE_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/call_llm';
const FETCH_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/call_prep';

export function CallPrepProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<CallPrepState>({
    latestAnalysis: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
  });

  const loadLatestAnalysis = useCallback(async () => {
    if (!token) {
      console.log('CallPrep: No token available, skipping load');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('CallPrep: Fetching data from GET endpoint');
      console.log('CallPrep: Token available:', !!token);
      console.log('CallPrep: API URL:', FETCH_API_URL);

      const headers = getAuthHeaders(token);
      console.log('CallPrep: Request headers:', headers);

      const response = await fetch(FETCH_API_URL, {
        method: 'GET',
        headers,
      });

      console.log('CallPrep: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CallPrep: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('CallPrep: Response data:', data);

      if (Array.isArray(data) && data.length > 0) {
        setState(prev => ({
          ...prev,
          latestAnalysis: data[0],
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

    } catch (error) {
      console.error('CallPrep: Load error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analysis',
        isLoading: false
      }));
    }
  }, [token]);

  const generateCallPrep = useCallback(async (prompt: string) => {
    if (!token) {
      console.error('CallPrep: No authentication token available');
      setState(prev => ({
        ...prev,
        error: 'Authentication required',
        isSubmitting: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      console.log('CallPrep: Generating with prompt:', prompt);
      console.log('CallPrep: Token available:', !!token);
      console.log('CallPrep: API URL:', GENERATE_API_URL);

      const headers = getAuthHeaders(token);
      console.log('CallPrep: Request headers:', headers);

      const response = await fetch(GENERATE_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
      });

      console.log('CallPrep: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CallPrep: Error response:', errorText);
        throw new Error(`Failed to generate call prep: ${response.status}`);
      }

      const data = await response.json();
      console.log('CallPrep: Response data:', data);

      if (Array.isArray(data) && data.length > 0) {
        setState(prev => ({
          ...prev,
          latestAnalysis: data[0],
          isSubmitting: false
        }));
      } else {
        throw new Error('No data returned from API');
      }

    } catch (error) {
      console.error('CallPrep: Error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isSubmitting: false
      }));
    }
  }, [token]);

  return (
    <CallPrepContext.Provider value={{ state, generateCallPrep, loadLatestAnalysis }}>
      {children}
    </CallPrepContext.Provider>
  );
}

export function useCallPrep() {
  const context = useContext(CallPrepContext);
  if (context === undefined) {
    throw new Error('useCallPrep must be used within a CallPrepProvider');
  }
  return context;
}
