'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { getAuthHeaders } from './config';
import {
  mergeKeyDecisionMakersWithEnrichment,
  type KeyDecisionMakerWithEnrichment,
} from '@/lib/utils/call-prep-data';

export interface KeyDecisionMaker {
  name: string;
  title: string;
  linkedin_url: string;
  email?: string;
  kdm_id?: number;
}

export interface CallPrepAnalysis {
  id: number;
  created_at: number;
  user_id: number;
  company_id: number;
  company_background: string;
  key_decision_makers: string;
  key_decision_makers_details?: string;
  recent_news_initiatives: string;
  potential_pain_points: string;
  strategic_talking_points_for_sales_call: string;
  suggested_value_propositions: string;
  call_action_plan: string;
  preparation_tip: string;
  prompt?: string;
  key_decision_makers_contact?: string;
  people_data?: string;
  keyDecisionMakersWithEnrichment?: KeyDecisionMakerWithEnrichment[];
}

interface CallPrepState {
  latestAnalysis: CallPrepAnalysis | null;
  allAnalyses: CallPrepAnalysis[];
  currentAnalysis: CallPrepAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isDeleting: boolean;
  justCompleted: CallPrepAnalysis | null;
}

interface CallPrepContextValue {
  state: CallPrepState;
  generateCallPrep: (prompt: string) => Promise<CallPrepAnalysis | null>;
  enrichPersonData: (
    person: KeyDecisionMaker,
    company: string,
  ) => Promise<{ status: number; data?: any }>;
  loadLatestAnalysis: () => Promise<void>;
  loadAllAnalyses: () => Promise<void>;
  selectAnalysis: (id: number) => void;
  deleteAnalysis: (id: number) => Promise<void>;
  clearJustCompleted: () => void;
}

const CallPrepContext = createContext<CallPrepContextValue | undefined>(undefined);

const GENERATE_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/post_card';
const FETCH_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/call_prep';
const DELETE_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/call_prep';
const ENRICHMENT_API_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl/people_enrichment_data';

/**
 * Process raw API data and merge enrichment data with key decision makers
 */
function processCallPrepData(rawData: any): CallPrepAnalysis {
  return {
    ...rawData,
    keyDecisionMakersWithEnrichment: mergeKeyDecisionMakersWithEnrichment(
      rawData.key_decision_makers_contact || '[]',
      rawData.people_data || '[]',
    ),
  };
}

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
    justCompleted: null,
  });

  const loadLatestAnalysis = useCallback(async () => {
    if (!token) {
      console.log('CallPrep: No token available, skipping load');
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

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
        const processedData = processCallPrepData(data[0]);
        setState((prev) => ({
          ...prev,
          latestAnalysis: processedData,
          currentAnalysis: processedData,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('CallPrep: Load error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analysis',
        isLoading: false,
      }));
    }
  }, [token]);

  const generateCallPrep = useCallback(
    async (prompt: string): Promise<CallPrepAnalysis | null> => {
      if (!token) {
        console.error('CallPrep: No authentication token available');
        setState((prev) => ({
          ...prev,
          error: 'Authentication required',
          isSubmitting: false,
        }));
        return null;
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        console.log('CallPrep: Generating with prompt:', prompt);
        console.log('CallPrep: Token available:', !!token);
        console.log('CallPrep: API URL:', GENERATE_API_URL);

        const headers = getAuthHeaders(token);
        console.log('CallPrep: Request headers:', headers);

        const response = await fetch(GENERATE_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt }),
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
          const processedData = processCallPrepData(data);
          setState((prev) => ({
            ...prev,
            latestAnalysis: processedData,
            currentAnalysis: processedData,
            allAnalyses: [
              processedData,
              ...prev.allAnalyses.filter((a) => a.id !== processedData.id),
            ],
            isSubmitting: false,
            justCompleted: processedData,
          }));
          return processedData;
        } else {
          throw new Error('No data returned from API');
        }
      } catch (error) {
        console.error('CallPrep: Error:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isSubmitting: false,
        }));
        return null;
      }
    },
    [token],
  );

  const enrichPersonData = useCallback(
    async (person: KeyDecisionMaker, company: string): Promise<{ status: number; data?: any }> => {
      if (!token) {
        console.error('CallPrep: No authentication token available');
        setState((prev) => ({
          ...prev,
          error: 'Authentication required',
        }));
        return { status: 401 };
      }

      // Check if person has kdm_id
      if (!person.kdm_id) {
        console.error('CallPrep: No kdm_id provided for enrichment');
        return { status: 400 };
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        console.log('CallPrep: Enriching person data:', { person, company });

        const headers = getAuthHeaders(token);
        const body = {
          company: company,
          kdm_id: person.kdm_id,
        };

        const response = await fetch(ENRICHMENT_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        console.log('CallPrep: Enrichment response status:', response.status);

        const data = await response.json();
        console.log('CallPrep: Enrichment response data:', data);

        setState((prev) => ({ ...prev, isSubmitting: false }));

        // Reload the latest analysis to get the updated enrichment data
        await loadLatestAnalysis();

        // Return the status and data
        return {
          status: data.status || response.status,
          data: data.data,
        };
      } catch (error) {
        console.error('CallPrep: Enrichment error:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isSubmitting: false,
        }));
        return { status: 500 };
      }
    },
    [token, loadLatestAnalysis],
  );

  const loadAllAnalyses = useCallback(async () => {
    if (!token) {
      console.log('CallPrep: No token available, skipping load all');
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

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
        const processedAnalyses = data.map(processCallPrepData);
        setState((prev) => ({
          ...prev,
          allAnalyses: processedAnalyses,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('CallPrep: Load all error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analyses',
        isLoading: false,
      }));
    }
  }, [token]);

  const selectAnalysis = useCallback(
    (id: number) => {
      const analysis = state.allAnalyses.find((a) => a.id === id);
      if (analysis) {
        setState((prev) => ({
          ...prev,
          currentAnalysis: analysis,
          latestAnalysis: analysis,
        }));
      }
    },
    [state.allAnalyses],
  );

  const deleteAnalysis = useCallback(
    async (id: number) => {
      if (!token) return;

      setState((prev) => ({ ...prev, isDeleting: true, error: null }));

      try {
        console.log('CallPrep: Deleting analysis with id:', id);
        const headers = getAuthHeaders(token);
        const response = await fetch(DELETE_API_URL, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ call_prep_id: id }),
        });

        console.log('CallPrep: Delete response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('CallPrep: Delete error response:', errorText);
          throw new Error(`Failed to delete analysis: ${response.status}`);
        }

        setState((prev) => ({
          ...prev,
          allAnalyses: prev.allAnalyses.filter((a) => a.id !== id),
          currentAnalysis: prev.currentAnalysis?.id === id ? null : prev.currentAnalysis,
          latestAnalysis: prev.latestAnalysis?.id === id ? null : prev.latestAnalysis,
          isDeleting: false,
        }));
      } catch (error) {
        console.error('CallPrep: Delete error:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to delete analysis',
          isDeleting: false,
        }));
      }
    },
    [token],
  );

  const clearJustCompleted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      justCompleted: null,
    }));
  }, []);

  return (
    <CallPrepContext.Provider
      value={{
        state,
        generateCallPrep,
        enrichPersonData,
        loadLatestAnalysis,
        loadAllAnalyses,
        selectAnalysis,
        deleteAnalysis,
        clearJustCompleted,
      }}
    >
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
