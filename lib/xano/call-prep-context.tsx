'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { getAuthHeaders } from './config';

export interface KeyDecisionMaker {
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
}

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
  prompt?: string;
  key_decision_makers_contact?: KeyDecisionMaker[] | null;
  people_data?: string | null;
}

interface CallPrepState {
  latestAnalysis: CallPrepAnalysis | null;
  allAnalyses: CallPrepAnalysis[];
  currentAnalysis: CallPrepAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isDeleting: boolean;
}

interface CallPrepContextValue {
  state: CallPrepState;
  generateCallPrep: (prompt: string) => Promise<CallPrepAnalysis | null>;
  enrichPersonData: (prompt: string, callPrepId: number, searchType: 'name' | 'linkedin_profile' | 'email', company: string) => Promise<void>;
  loadLatestAnalysis: () => Promise<void>;
  loadAllAnalyses: () => Promise<void>;
  selectAnalysis: (id: number) => void;
  deleteAnalysis: (id: number) => Promise<void>;
}

const CallPrepContext = createContext<CallPrepContextValue | undefined>(undefined);

const GENERATE_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/post_card';
const FETCH_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/call_prep';
const ENRICHMENT_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/people_enrichment_data';

export function CallPrepProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<CallPrepState>({
    latestAnalysis: null,
    allAnalyses: [],
    currentAnalysis: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
    isDeleting: false,
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
          currentAnalysis: data[0],
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

  const generateCallPrep = useCallback(async (prompt: string): Promise<CallPrepAnalysis | null> => {
    if (!token) {
      console.error('CallPrep: No authentication token available');
      setState(prev => ({
        ...prev,
        error: 'Authentication required',
        isSubmitting: false
      }));
      return null;
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

      // The API returns a single object, not an array
      if (data && data.id) {
        setState(prev => ({
          ...prev,
          latestAnalysis: data,
          currentAnalysis: data,
          allAnalyses: [data, ...prev.allAnalyses],
          isSubmitting: false
        }));
        return data;
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
      return null;
    }
  }, [token]);

  const enrichPersonData = useCallback(async (
    prompt: string,
    callPrepId: number,
    searchType: 'name' | 'linkedin_profile' | 'email',
    company: string
  ) => {
    if (!token) {
      console.error('CallPrep: No authentication token available');
      setState(prev => ({
        ...prev,
        error: 'Authentication required',
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      console.log('CallPrep: Enriching person data:', { prompt, callPrepId, searchType, company });

      const headers = getAuthHeaders(token);
      const body = {
        prompt,
        call_prep_id: callPrepId,
        search_type: searchType,
        company,
      };

      const response = await fetch(ENRICHMENT_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      console.log('CallPrep: Enrichment response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CallPrep: Enrichment error response:', errorText);
        throw new Error(`Failed to enrich person data: ${response.status}`);
      }

      // After enrichment, reload the call prep data
      await loadLatestAnalysis();

      setState(prev => ({ ...prev, isSubmitting: false }));

    } catch (error) {
      console.error('CallPrep: Enrichment error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isSubmitting: false
      }));
    }
  }, [token, loadLatestAnalysis]);

  const loadAllAnalyses = useCallback(async () => {
    if (!token) {
      console.log('CallPrep: No token available, skipping load all');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const headers = getAuthHeaders(token);
      const response = await fetch(FETCH_API_URL, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setState(prev => ({
          ...prev,
          allAnalyses: data,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('CallPrep: Load all error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analyses',
        isLoading: false
      }));
    }
  }, [token]);

  const selectAnalysis = useCallback((id: number) => {
    const analysis = state.allAnalyses.find(a => a.id === id);
    if (analysis) {
      setState(prev => ({
        ...prev,
        currentAnalysis: analysis,
        latestAnalysis: analysis
      }));
    }
  }, [state.allAnalyses]);

  const deleteAnalysis = useCallback(async (id: number) => {
    if (!token) return;

    setState(prev => ({ ...prev, isDeleting: true, error: null }));

    try {
      const headers = getAuthHeaders(token);
      const response = await fetch(`${FETCH_API_URL}/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete analysis: ${response.status}`);
      }

      setState(prev => ({
        ...prev,
        allAnalyses: prev.allAnalyses.filter(a => a.id !== id),
        currentAnalysis: prev.currentAnalysis?.id === id ? null : prev.currentAnalysis,
        latestAnalysis: prev.latestAnalysis?.id === id ? null : prev.latestAnalysis,
        isDeleting: false
      }));
    } catch (error) {
      console.error('CallPrep: Delete error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete analysis',
        isDeleting: false
      }));
    }
  }, [token]);

  return (
    <CallPrepContext.Provider value={{ state, generateCallPrep, enrichPersonData, loadLatestAnalysis, loadAllAnalyses, selectAnalysis, deleteAnalysis }}>
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
