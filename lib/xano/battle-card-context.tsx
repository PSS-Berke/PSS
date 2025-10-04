'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { battleCardApi } from './api';
import type { BattleCard, CreateBattleCardRequest } from './types';
import { useAuth } from './auth-context';

// State interface
interface BattleCardState {
  battleCards: BattleCard[];
  activeBattleCard: BattleCard | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

// Action types
type BattleCardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BATTLE_CARDS'; payload: BattleCard[] }
  | { type: 'SET_ACTIVE_BATTLE_CARD'; payload: BattleCard | null }
  | { type: 'ADD_BATTLE_CARD'; payload: BattleCard }
  | { type: 'REMOVE_BATTLE_CARD'; payload: number };

// Initial state
const initialState: BattleCardState = {
  battleCards: [],
  activeBattleCard: null,
  isLoading: false,
  isGenerating: false,
  error: null,
};

// Reducer
function battleCardReducer(state: BattleCardState, action: BattleCardAction): BattleCardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BATTLE_CARDS':
      return { ...state, battleCards: action.payload };
    case 'SET_ACTIVE_BATTLE_CARD':
      return { ...state, activeBattleCard: action.payload };
    case 'ADD_BATTLE_CARD':
      return {
        ...state,
        battleCards: [...state.battleCards, action.payload],
        activeBattleCard: action.payload
      };
    case 'REMOVE_BATTLE_CARD':
      const filteredCards = state.battleCards.filter(card => card.id !== action.payload);
      const newActiveCard = state.activeBattleCard?.id === action.payload
        ? (filteredCards.length > 0 ? filteredCards[0] : null)
        : state.activeBattleCard;
      return {
        ...state,
        battleCards: filteredCards,
        activeBattleCard: newActiveCard
      };
    default:
      return state;
  }
}

// Context
interface BattleCardContextValue {
  state: BattleCardState;
  loadBattleCards: () => Promise<void>;
  generateBattleCard: (data: CreateBattleCardRequest) => Promise<void>;
  deleteBattleCard: (cardId: number) => Promise<void>;
  setActiveBattleCard: (card: BattleCard | null) => void;
}

const BattleCardContext = createContext<BattleCardContextValue | undefined>(undefined);

// Provider
export function BattleCardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(battleCardReducer, initialState);
  const { user, token } = useAuth();

  const loadBattleCards = useCallback(async () => {
    if (!token || !user) {
      console.log('BattleCard: No token or user, skipping loadBattleCards');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cards = await battleCardApi.getBattleCards(token, user.id);
      dispatch({ type: 'SET_BATTLE_CARDS', payload: cards });

      // Set first card as active if no active card
      if (cards.length > 0 && !state.activeBattleCard) {
        dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: cards[0] });
      }
    } catch (error) {
      console.error('BattleCard: Error loading battle cards:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load battle cards' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, user]);

  const generateBattleCard = useCallback(async (data: CreateBattleCardRequest) => {
    if (!token || !user) {
      throw new Error('Authentication required');
    }

    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newCard = await battleCardApi.generateBattleCard(token, data, user.id);
      dispatch({ type: 'ADD_BATTLE_CARD', payload: newCard });
    } catch (error) {
      console.error('BattleCard: Error generating battle card:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to generate battle card' });
      throw error;
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [token, user]);

  const deleteBattleCard = useCallback(async (cardId: number) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      await battleCardApi.deleteBattleCard(token, cardId);
      dispatch({ type: 'REMOVE_BATTLE_CARD', payload: cardId });
    } catch (error) {
      console.error('BattleCard: Error deleting battle card:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete battle card' });
      throw error;
    }
  }, [token]);

  const setActiveBattleCard = useCallback((card: BattleCard | null) => {
    dispatch({ type: 'SET_ACTIVE_BATTLE_CARD', payload: card });
  }, []);

  // Load battle cards on mount
  useEffect(() => {
    if (user && token) {
      loadBattleCards();
    }
  }, [user, token]); // Only depend on user and token, not loadBattleCards

  const value: BattleCardContextValue = {
    state,
    loadBattleCards,
    generateBattleCard,
    deleteBattleCard,
    setActiveBattleCard,
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
