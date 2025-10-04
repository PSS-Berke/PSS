'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CallPrepAnalysis {
  id: string;
  company: string;
  product: string;
  analysis: string;
  timestamp: string;
}

interface CallPrepState {
  latestAnalysis: CallPrepAnalysis | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
}

interface CallPrepContextValue {
  state: CallPrepState;
  submitCompanyData: (company: string, product: string) => Promise<void>;
  loadLatestAnalysis: () => Promise<void>;
}

const CallPrepContext = createContext<CallPrepContextValue | undefined>(undefined);

const SHEET_ID = '18T1SpAgAtNuFvuQbIDYk1kbseUh9SjI-K7KbWp-AFIw';
const SHEET_NAME = 'AI response';
const API_KEY = 'AIzaSyByJ6DDQaBY-sPquTQ4ppml2J0ThTlgTbc';
const WEBHOOK_URL = 'https://eos17tgdrxpcspp.m.pipedream.net';
const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`;

export function CallPrepProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CallPrepState>({
    latestAnalysis: null,
    isLoading: false,
    error: null,
    isSubmitting: false,
  });

  const submitCompanyData = useCallback(async (company: string, product: string) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const data = {
        company,
        product,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit company data');
      }

      // Auto-refresh after 3 seconds
      setTimeout(() => {
        loadLatestAnalysis();
      }, 3000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isSubmitting: false
      }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, []);

  const loadLatestAnalysis = useCallback(async () => {
    // Don't show loading state during background polling to prevent UI flashing
    const isInitialLoad = state.latestAnalysis === null;

    if (isInitialLoad) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const response = await fetch(SHEET_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      const rows = jsonData.values;

      if (!rows || rows.length < 1) {
        throw new Error('No data found in sheet');
      }

      // Get the latest row (last row) and column A value (index 0)
      const latestRow = rows[rows.length - 1];
      const analysisText = latestRow[0] || 'No analysis available';

      // Only update state if the data has actually changed
      setState(prev => {
        const newAnalysis = analysisText;
        const currentAnalysis = prev.latestAnalysis?.analysis;

        // Deep comparison: only update if analysis text is different
        if (currentAnalysis === newAnalysis) {
          // Data hasn't changed, just clear loading state without triggering re-render
          return isInitialLoad ? { ...prev, isLoading: false } : prev;
        }

        // Data has changed, update the state
        return {
          ...prev,
          latestAnalysis: {
            id: `${rows.length}`,
            company: '',
            product: '',
            analysis: analysisText,
            timestamp: new Date().toISOString()
          },
          isLoading: false
        };
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load analysis',
        isLoading: false
      }));
    }
  }, [state.latestAnalysis]);

  return (
    <CallPrepContext.Provider value={{ state, submitCompanyData, loadLatestAnalysis }}>
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
