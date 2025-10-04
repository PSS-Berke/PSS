'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { battleCardApi } from './api';
import type {
  BattleCard,
  BattleCardCampaign,
  BattleCardCampaignPage,
  CreateBattleCardRequest,
  CreateBattleCardCampaignRequest,
  EditBattleCardCampaignPayload
} from './types';
import { useAuth } from './auth-context';

// State interface
interface BattleCardState {
  // Current active card
  activeCard: BattleCard | null;

  // All campaigns and their cards
  campaigns: BattleCardCampaignPage[];

  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  isCreatingCampaign: boolean;
  isSwitchingCard: boolean;

  // Error state
  error: string | null;
}

// Action types
type BattleCardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_CREATING_CAMPAIGN'; payload: boolean }
  | { type: 'SET_SWITCHING_CARD'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_CARD'; payload: BattleCard | null }
  | { type: 'SET_CAMPAIGNS'; payload: BattleCardCampaignPage[] }
  | { type: 'ADD_CAMPAIGN'; payload: BattleCardCampaignPage }
  | { type: 'UPDATE_CARD_IN_CAMPAIGNS'; payload: BattleCard }
  | { type: 'ADD_CARD_TO_CAMPAIGN'; payload: BattleCard }
  | { type: 'UPDATE_CAMPAIGN'; payload: BattleCardCampaignPage }
  | { type: 'REMOVE_CARD_FROM_CAMPAIGNS'; payload: number };

// Initial state
const initialState: BattleCardState = {
  activeCard: null,
  campaigns: [],
  isLoading: false,
  isGenerating: false,
  isCreatingCampaign: false,
  isSwitchingCard: false,
  error: null,
};

// Reducer
function battleCardReducer(state: BattleCardState, action: BattleCardAction): BattleCardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_CREATING_CAMPAIGN':
      return { ...state, isCreatingCampaign: action.payload };
    case 'SET_SWITCHING_CARD':
      return { ...state, isSwitchingCard: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_CARD':
      console.log('BattleCard: Reducer SET_ACTIVE_CARD called with:', action.payload);
      return { ...state, activeCard: action.payload };
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_CARD_IN_CAMPAIGNS':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign => {
          let records = campaign.records;
          if (Array.isArray(campaign.records)) {
            records = campaign.records.map((card: BattleCard) =>
              card.id === action.payload.id ? action.payload : card
            );
          }
          return {
            ...campaign,
            records
          };
        })
      };
    case 'ADD_CARD_TO_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign => {
          if (campaign.battle_card_campaign_id === action.payload.battle_card_campaign_id) {
            const cards = Array.isArray(campaign.records) ? campaign.records : [];
            const exists = cards.some(card => card.id === action.payload.id);
            return {
              ...campaign,
              records: exists ? cards : [action.payload, ...cards]
            };
          }
          return campaign;
        })
      };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign =>
          campaign.battle_card_campaign_id === action.payload.battle_card_campaign_id
            ? {
                ...campaign,
                ...action.payload,
                records: Array.isArray(action.payload.records) ? action.payload.records : campaign.records,
              }
            : campaign
        ),
      };
    case 'REMOVE_CARD_FROM_CAMPAIGNS':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign => ({
          ...campaign,
          records: Array.isArray(campaign.records)
            ? campaign.records.filter(card => card.id !== action.payload)
            : campaign.records
        })),
        activeCard: state.activeCard?.id === action.payload ? null : state.activeCard
      };
    default:
      return state;
  }
}

// Context
interface BattleCardContextType {
  state: BattleCardState;

  // Campaign management
  createCampaign: (data: CreateBattleCardCampaignRequest) => Promise<void>;
  loadCampaigns: () => Promise<void>;
  updateCampaign: (payload: EditBattleCardCampaignPayload) => Promise<BattleCardCampaignPage | null>;

  // Card management
  changeCard: (cardId: number) => Promise<void>;
  generateCard: (data: CreateBattleCardRequest) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
  setActiveCard: (card: BattleCard | null) => void;

  // Utility
  clearError: () => void;
}

const BattleCardContext = createContext<BattleCardContextType | undefined>(undefined);

// Provider component
export function BattleCardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(battleCardReducer, initialState);
  const { user, token } = useAuth();
  const isLoadingCampaignsRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    if (isLoadingCampaignsRef.current) {
      console.log('BattleCard: loadCampaigns already in progress, skipping duplicate call');
      return;
    }
    isLoadingCampaignsRef.current = true;

    if (!token) {
      console.log('BattleCard: No token available for loadCampaigns');
      isLoadingCampaignsRef.current = false;
      return;
    }

    const parseCampaignRecords = (rawCampaigns: BattleCardCampaignPage[]): BattleCardCampaignPage[] =>
      rawCampaigns.map(campaign => {
        let records = campaign.records;
        if (typeof records === 'string') {
          try {
            records = JSON.parse(records);
          } catch (error) {
            console.error('BattleCard: Failed to parse records JSON:', error);
            records = [];
          }
        }
        return {
          ...campaign,
          records
        };
      });

    const assignActiveCardFromCampaigns = (campaignsData: BattleCardCampaignPage[], currentCardId: number | null | undefined) => {
      const activeCard = campaignsData.reduce<BattleCard | null>((found, campaign) => {
        if (found) return found;
        const records = Array.isArray(campaign.records) ? campaign.records : [];
        return records[0] || null; // Get first card from first campaign
      }, null);

      const hadCurrentCard = currentCardId != null;

      if (activeCard) {
        const isSameCard = currentCardId === activeCard.id;
        dispatch({ type: 'SET_ACTIVE_CARD', payload: activeCard });
      } else if (hadCurrentCard) {
        dispatch({ type: 'SET_ACTIVE_CARD', payload: null });
      }
    };

    try {
      console.log('BattleCard: Loading campaigns with token:', token.substring(0, 20) + '...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const campaigns = await battleCardApi.getCampaigns(token);
      const parsedCampaigns = parseCampaignRecords(campaigns);

      dispatch({ type: 'SET_CAMPAIGNS', payload: parsedCampaigns });
      assignActiveCardFromCampaigns(parsedCampaigns, state.activeCard?.id);
    } catch (error) {
      console.error('BattleCard: Error loading campaigns:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load campaigns' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      isLoadingCampaignsRef.current = false;
    }
  }, [token]);

  // Change card
  const changeCard = useCallback(async (cardId: number) => {
    if (!token) return;

    console.log('BattleCard: changeCard called with cardId:', cardId);

    try {
      dispatch({ type: 'SET_SWITCHING_CARD', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Find card in campaigns
      const card = state.campaigns.reduce<BattleCard | null>((found, campaign) => {
        if (found) return found;
        const records = Array.isArray(campaign.records) ? campaign.records : [];
        return records.find(c => c.id === cardId) || null;
      }, null);

      if (card) {
        dispatch({ type: 'SET_ACTIVE_CARD', payload: card });
      }
    } catch (error) {
      console.error('BattleCard: Error changing card:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to change card' });
    } finally {
      dispatch({ type: 'SET_SWITCHING_CARD', payload: false });
    }
  }, [token, state.campaigns]);

  // Create campaign
  const createCampaign = useCallback(async (data: CreateBattleCardCampaignRequest) => {
    if (!token) return;

    try {
      dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await battleCardApi.createCampaign(token, data);

      // Reload campaigns to get the new campaign
      await loadCampaigns();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create campaign' });
    } finally {
      dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: false });
    }
  }, [token, loadCampaigns]);

  // Generate card
  const generateCard = useCallback(async (data: CreateBattleCardRequest) => {
    if (!token || !user) {
      throw new Error('Authentication required');
    }

    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newCard = await battleCardApi.generateBattleCard(token, data, user.id);
      dispatch({ type: 'ADD_CARD_TO_CAMPAIGN', payload: newCard });
      dispatch({ type: 'SET_ACTIVE_CARD', payload: newCard });

      // Reload campaigns to get updated data
      await loadCampaigns();
    } catch (error) {
      console.error('BattleCard: Error generating card:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to generate card' });
      throw error;
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [token, user, loadCampaigns]);

  // Delete card
  const deleteCard = useCallback(async (cardId: number) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      await battleCardApi.deleteBattleCard(token, cardId);
      dispatch({ type: 'REMOVE_CARD_FROM_CAMPAIGNS', payload: cardId });
    } catch (error) {
      console.error('BattleCard: Error deleting card:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete card' });
      throw error;
    }
  }, [token]);

  // Update campaign
  const updateCampaign = useCallback(async (payload: EditBattleCardCampaignPayload) => {
    if (!token) return null;

    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const updatedCampaign = await battleCardApi.editCampaign(token, payload);

      const mappedCampaign: BattleCardCampaignPage = {
        battle_card_campaign_id: updatedCampaign.id,
        name: updatedCampaign.name,
        description: updatedCampaign.description,
        created_at: updatedCampaign.created_at,
        records: [],
      };

      dispatch({ type: 'UPDATE_CAMPAIGN', payload: mappedCampaign });
      await loadCampaigns();
      return mappedCampaign;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update campaign',
      });
      return null;
    }
  }, [token, loadCampaigns]);

  const setActiveCard = useCallback((card: BattleCard | null) => {
    dispatch({ type: 'SET_ACTIVE_CARD', payload: card });
  }, []);

  // Auto-load campaigns when user is authenticated
  useEffect(() => {
    console.log('BattleCard: useEffect triggered - user:', !!user, 'token:', !!token);
    if (user && token && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      console.log('BattleCard: Auto-loading campaigns...');
      loadCampaigns();
    }

    if (!user || !token) {
      hasInitializedRef.current = false;
      isLoadingCampaignsRef.current = false;
    }
  }, [user, token, loadCampaigns]);

  const value: BattleCardContextType = {
    state,
    createCampaign,
    loadCampaigns,
    updateCampaign,
    changeCard,
    generateCard,
    deleteCard,
    setActiveCard,
    clearError,
  };

  return (
    <BattleCardContext.Provider value={value}>
      {children}
    </BattleCardContext.Provider>
  );
}

// Hook
export function useBattleCard() {
  const context = useContext(BattleCardContext);
  if (!context) {
    throw new Error('useBattleCard must be used within a BattleCardProvider');
  }
  return context;
}
