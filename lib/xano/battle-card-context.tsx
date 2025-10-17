'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { battleCardApi } from './api';
import type { BattleCard, CreateBattleCardRequest, BattleCardListItem } from './types';
import { useAuth } from './auth-context';

// State interface
interface BattleCardState {
  battleCardsList: BattleCardListItem[];
  activeBattleCard: BattleCard | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isGenerating: boolean;
  error: string | null;
}

// Action types
type BattleCardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_DETAIL'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BATTLE_CARDS_LIST'; payload: BattleCardListItem[] }
  | { type: 'SET_ACTIVE_BATTLE_CARD'; payload: BattleCard | null }
  | { type: 'ADD_BATTLE_CARD'; payload: BattleCardListItem }
  | { type: 'REMOVE_BATTLE_CARD'; payload: number };

// Initial state
const initialState: BattleCardState = {
  battleCardsList: [],
  activeBattleCard: null,
  isLoading: false,
  isLoadingDetail: false,
  isGenerating: false,
  error: null,
};

// Reducer
function battleCardReducer(state: BattleCardState, action: BattleCardAction): BattleCardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_DETAIL':
      return { ...state, isLoadingDetail: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BATTLE_CARDS_LIST':
      return { ...state, battleCardsList: action.payload };
    case 'SET_ACTIVE_BATTLE_CARD':
      console.log('BattleCard Reducer: Setting active battle card:', action.payload);
      return { ...state, activeBattleCard: action.payload };
    case 'ADD_BATTLE_CARD':
      return {
        ...state,
        battleCardsList: [...state.battleCardsList, action.payload],
      };
    case 'REMOVE_BATTLE_CARD':
      const filteredCards = state.battleCardsList.filter((card) => card.id !== action.payload);
      const shouldClearActive = state.activeBattleCard?.id === action.payload;
      return {
        ...state,
        battleCardsList: filteredCards,
        activeBattleCard: shouldClearActive ? null : state.activeBattleCard,
      };
    default:
      return state;
  }
}

// Context
interface BattleCardContextValue {
  state: BattleCardState;
  loadBattleCardsList: () => Promise<void>;
  loadBattleCardDetail: (cardId: number) => Promise<void>;
  generateBattleCard: (data: CreateBattleCardRequest) => Promise<void>;
  regenerateBattleCard: (
    cardId: number,
    competitorName: string,
    serviceName: string,
  ) => Promise<void>;
  updateBattleCard: (cardId: number, data: Partial<BattleCard>) => Promise<void>;
  deleteBattleCard: (cardId: number) => Promise<void>;
  clearActiveBattleCard: () => void;
}

const BattleCardContext = createContext<BattleCardContextValue | undefined>(undefined);

// Provider
export function BattleCardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(battleCardReducer, initialState);
  const { user, token } = useAuth();

  const loadBattleCardsList = useCallback(async () => {
    if (!token) {
      console.log('BattleCard: No token, skipping loadBattleCardsList');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cardsList = await battleCardApi.getBattleCardsList(token);
      dispatch({ type: 'SET_BATTLE_CARDS_LIST', payload: cardsList });
    } catch (error) {
      console.error('BattleCard: Error loading battle cards list:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load battle cards list',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token]);

  const loadBattleCardDetail = useCallback(
    async (cardId: number) => {
      if (!token) {
        console.log('BattleCard: No token, skipping loadBattleCardDetail');
        return;
      }

      console.log('BattleCard: Loading battle card detail for ID:', cardId);
      dispatch({ type: 'SET_LOADING_DETAIL', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const cardDetail = await battleCardApi.getBattleCardDetail(token, cardId);
        console.log('BattleCard: Received card detail:', cardDetail);
        dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: cardDetail });
        console.log('BattleCard: Dispatched SET_ACTIVE_BATTLE_CARD');
      } catch (error) {
        console.error('BattleCard: Error loading battle card detail:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load battle card detail',
        });
      } finally {
        dispatch({ type: 'SET_LOADING_DETAIL', payload: false });
      }
    },
    [token],
  );

  const generateBattleCard = useCallback(
    async (data: CreateBattleCardRequest) => {
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const newCard = await battleCardApi.generateBattleCard(token, data, user.id);
        // Add to list
        dispatch({
          type: 'ADD_BATTLE_CARD',
          payload: {
            id: newCard.id,
            competitor_name: newCard.competitor_name,
            competitor_overview: newCard.company_overview,
          },
        });
        // Set as active
        dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: newCard });
      } catch (error) {
        console.error('BattleCard: Error generating battle card:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to generate battle card',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_GENERATING', payload: false });
      }
    },
    [token, user],
  );

  const deleteBattleCard = useCallback(
    async (cardId: number) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        await battleCardApi.deleteBattleCard(token, cardId);
        dispatch({ type: 'REMOVE_BATTLE_CARD', payload: cardId });
      } catch (error) {
        console.error('BattleCard: Error deleting battle card:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to delete battle card',
        });
        throw error;
      }
    },
    [token],
  );

  const regenerateBattleCard = useCallback(
    async (cardId: number, competitorName: string, serviceName: string) => {
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      dispatch({ type: 'SET_GENERATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // First delete the old card
        await battleCardApi.deleteBattleCard(token, cardId);

        // Generate a new one with updated info
        const newCard = await battleCardApi.generateBattleCard(
          token,
          { competitor_name: competitorName, service_name: serviceName },
          user.id,
        );

        // Update the active card and refresh the list
        dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: newCard });
        await loadBattleCardsList();
      } catch (error) {
        console.error('BattleCard: Error regenerating battle card:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to regenerate battle card',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_GENERATING', payload: false });
      }
    },
    [token, user, loadBattleCardsList],
  );

  const updateBattleCard = useCallback(
    async (cardId: number, data: Partial<BattleCard>) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const updatedCard = await battleCardApi.updateBattleCard(token, cardId, data);
        // Update the active battle card if it's the one being edited
        if (state.activeBattleCard?.id === cardId) {
          dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: updatedCard });
        }
        // Reload the list to reflect changes
        await loadBattleCardsList();
      } catch (error) {
        console.error('BattleCard: Error updating battle card:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update battle card',
        });
        throw error;
      }
    },
    [token, state.activeBattleCard?.id, loadBattleCardsList],
  );

  const clearActiveBattleCard = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: null });
  }, []);

  // Load battle cards list on mount
  useEffect(() => {
    if (token) {
      loadBattleCardsList();
    }
  }, [token, loadBattleCardsList]);

  // Refetch data when company changes
  useEffect(() => {
    if (user?.company_id && token) {
      console.log(
        'BattleCard: Company changed, reloading battle cards for company:',
        user.company_id,
      );
      loadBattleCardsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id]);

  const value: BattleCardContextValue = {
    state,
    loadBattleCardsList,
    loadBattleCardDetail,
    generateBattleCard,
    regenerateBattleCard,
    updateBattleCard,
    deleteBattleCard,
    clearActiveBattleCard,
  };

  return <BattleCardContext.Provider value={value}>{children}</BattleCardContext.Provider>;
}

// Hook
export function useBattleCard() {
  const context = useContext(BattleCardContext);
  if (!context) {
    throw new Error('useBattleCard must be used within a BattleCardProvider');
  }
  return context;
}
