'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  WebsiteSite,
  PlatformType,
  AnalyticsCategory,
  AnalyticsCategoryData,
  ConnectSitePayload,
} from './types';

// State interface
interface WixAnalyticsState {
  sites: WebsiteSite[];
  selectedSiteId: number | null;
  selectedPlatform: PlatformType | null;
  selectedCategory: AnalyticsCategory;
  categoryData: Record<string, AnalyticsCategoryData>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

// Action types
type WixAnalyticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SITES'; payload: WebsiteSite[] }
  | { type: 'SET_SELECTED_SITE'; payload: number | null }
  | { type: 'SET_SELECTED_PLATFORM'; payload: PlatformType | null }
  | { type: 'SET_SELECTED_CATEGORY'; payload: AnalyticsCategory }
  | { type: 'SET_CATEGORY_DATA'; payload: { key: string; data: AnalyticsCategoryData } }
  | { type: 'ADD_SITE'; payload: WebsiteSite }
  | { type: 'REMOVE_SITE'; payload: number }
  | { type: 'UPDATE_SITE'; payload: WebsiteSite }
  | { type: 'SET_LAST_FETCHED'; payload: string };

// Initial state
const initialState: WixAnalyticsState = {
  sites: [],
  selectedSiteId: null,
  selectedPlatform: null,
  selectedCategory: 'overview',
  categoryData: {},
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
};

// Reducer
function wixAnalyticsReducer(
  state: WixAnalyticsState,
  action: WixAnalyticsAction,
): WixAnalyticsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SITES':
      return { ...state, sites: action.payload };
    case 'SET_SELECTED_SITE':
      return { ...state, selectedSiteId: action.payload };
    case 'SET_SELECTED_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_CATEGORY_DATA':
      return {
        ...state,
        categoryData: { ...state.categoryData, [action.payload.key]: action.payload.data },
      };
    case 'ADD_SITE':
      return { ...state, sites: [...state.sites, action.payload] };
    case 'REMOVE_SITE':
      return { ...state, sites: state.sites.filter((site) => site.id !== action.payload) };
    case 'UPDATE_SITE':
      return {
        ...state,
        sites: state.sites.map((site) => (site.id === action.payload.id ? action.payload : site)),
      };
    case 'SET_LAST_FETCHED':
      return { ...state, lastFetchedAt: action.payload };
    default:
      return state;
  }
}

// Context interface
interface WixAnalyticsContextValue {
  state: WixAnalyticsState;
  fetchSites: () => Promise<void>;
  selectSite: (siteId: number | null) => void;
  selectPlatform: (platform: PlatformType | null) => void;
  selectCategory: (category: AnalyticsCategory) => void;
  connectSite: (payload: ConnectSitePayload) => Promise<WebsiteSite | null>;
  disconnectSite: (siteId: number) => Promise<void>;
  refreshMetrics: () => Promise<void>;
  getCategoryData: (categoryKey: string) => AnalyticsCategoryData | null;
}

const WixAnalyticsContext = createContext<WixAnalyticsContextValue | undefined>(undefined);

// Provider component
export function WixAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wixAnalyticsReducer, initialState);

  // Fetch sites from API
  const fetchSites = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wix-analytics/sites');
      // const data = await response.json();

      // Mock data for now
      const mockSites: WebsiteSite[] = [];

      dispatch({ type: 'SET_SITES', payload: mockSites });
      dispatch({ type: 'SET_LAST_FETCHED', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch sites',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Select a site
  const selectSite = useCallback(
    (siteId: number | null) => {
      dispatch({ type: 'SET_SELECTED_SITE', payload: siteId });
      if (siteId) {
        const site = state.sites.find((s) => s.id === siteId);
        if (site) {
          dispatch({ type: 'SET_SELECTED_PLATFORM', payload: site.platform_type });
        }
      }
    },
    [state.sites],
  );

  // Select a platform
  const selectPlatform = useCallback((platform: PlatformType | null) => {
    dispatch({ type: 'SET_SELECTED_PLATFORM', payload: platform });
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: 'overview' });
  }, []);

  // Select a category
  const selectCategory = useCallback((category: AnalyticsCategory) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  }, []);

  // Connect a new site
  const connectSite = useCallback(
    async (payload: ConnectSitePayload): Promise<WebsiteSite | null> => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/wix-analytics/sites', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload),
        // });
        // const newSite = await response.json();

        // Mock response
        const newSite: WebsiteSite = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          site_name: payload.site_name,
          site_url: payload.site_url,
          platform_type: payload.platform_type,
          is_connected: true,
          last_sync_at: new Date().toISOString(),
          user_id: 1,
        };

        dispatch({ type: 'ADD_SITE', payload: newSite });
        return newSite;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to connect site',
        });
        return null;
      }
    },
    [],
  );

  // Disconnect a site
  const disconnectSite = useCallback(
    async (siteId: number) => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/wix-analytics/sites/${siteId}`, { method: 'DELETE' });

        dispatch({ type: 'REMOVE_SITE', payload: siteId });

        if (state.selectedSiteId === siteId) {
          dispatch({ type: 'SET_SELECTED_SITE', payload: null });
          dispatch({ type: 'SET_SELECTED_PLATFORM', payload: null });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to disconnect site',
        });
      }
    },
    [state.selectedSiteId],
  );

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch({ type: 'SET_LAST_FETCHED', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to refresh metrics',
      });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, []);

  // Get category data
  const getCategoryData = useCallback(
    (categoryKey: string): AnalyticsCategoryData | null => {
      return state.categoryData[categoryKey] || null;
    },
    [state.categoryData],
  );

  // Load sites on mount
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const value: WixAnalyticsContextValue = {
    state,
    fetchSites,
    selectSite,
    selectPlatform,
    selectCategory,
    connectSite,
    disconnectSite,
    refreshMetrics,
    getCategoryData,
  };

  return <WixAnalyticsContext.Provider value={value}>{children}</WixAnalyticsContext.Provider>;
}

// Custom hook
export function useWixAnalytics() {
  const context = useContext(WixAnalyticsContext);
  if (context === undefined) {
    throw new Error('useWixAnalytics must be used within a WixAnalyticsProvider');
  }
  return context;
}
