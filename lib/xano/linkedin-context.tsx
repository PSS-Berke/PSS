'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { linkedInApi } from './api';
import type { 
  LinkedInSession, 
  LinkedInMessage, 
  CampaignPage, 
  CreateCampaignParams 
} from './types';
import { useAuth } from './auth-context';

// State interface
interface LinkedInState {
  // Current session
  currentSession: LinkedInSession | null;
  
  // Messages for current session
  messages: LinkedInMessage[];
  
  // All campaigns and sessions
  pages: CampaignPage[];
  
  // Loading states
  isLoading: boolean;
  isSendingMessage: boolean;
  isCreatingCampaign: boolean;
  isSwitchingSession: boolean;
  
  // Error state
  error: string | null;
}

// Action types
type LinkedInAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING_MESSAGE'; payload: boolean }
  | { type: 'SET_CREATING_CAMPAIGN'; payload: boolean }
  | { type: 'SET_SWITCHING_SESSION'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_SESSION'; payload: LinkedInSession | null }
  | { type: 'SET_MESSAGES'; payload: LinkedInMessage[] }
  | { type: 'ADD_MESSAGE'; payload: LinkedInMessage }
  | { type: 'SET_PAGES'; payload: CampaignPage[] }
  | { type: 'ADD_CAMPAIGN_PAGE'; payload: CampaignPage }
  | { type: 'UPDATE_SESSION_IN_PAGES'; payload: LinkedInSession };

// Initial state
const initialState: LinkedInState = {
  currentSession: null,
  messages: [],
  pages: [],
  isLoading: false,
  isSendingMessage: false,
  isCreatingCampaign: false,
  isSwitchingSession: false,
  error: null,
};

// Reducer
function linkedInReducer(state: LinkedInState, action: LinkedInAction): LinkedInState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SENDING_MESSAGE':
      return { ...state, isSendingMessage: action.payload };
    case 'SET_CREATING_CAMPAIGN':
      return { ...state, isCreatingCampaign: action.payload };
    case 'SET_SWITCHING_SESSION':
      return { ...state, isSwitchingSession: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_SESSION':
      console.log('LinkedIn: Reducer SET_CURRENT_SESSION called with:', action.payload);
      return { ...state, currentSession: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_PAGES':
      return { ...state, pages: action.payload };
    case 'ADD_CAMPAIGN_PAGE':
      return { ...state, pages: [...state.pages, action.payload] };
    case 'UPDATE_SESSION_IN_PAGES':
      return {
        ...state,
        pages: state.pages.map(page => ({
          ...page,
          records: page.records.map(session =>
            session.id === action.payload.id ? action.payload : session
          )
        }))
      };
    default:
      return state;
  }
}

// Context
interface LinkedInContextType {
  state: LinkedInState;
  
  // Session management
  changeChat: (sessionId: string) => Promise<void>;
  deleteChat: (sessionId: string) => Promise<void>;
  
  // Campaign management
  createCampaign: (params: CreateCampaignParams) => Promise<void>;
  loadPages: () => Promise<void>;
  
  // Messaging
  sendMessage: (prompt: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

const LinkedInContext = createContext<LinkedInContextType | undefined>(undefined);

// Provider component
export function LinkedInProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(linkedInReducer, initialState);
  const { user, token } = useAuth();


  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!token) {
      console.log('LinkedIn: No token available for loadMessages');
      return;
    }
    
    try {
      console.log('LinkedIn: Loading messages with token:', token.substring(0, 20) + '...');
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const messages = await linkedInApi.getMessages(token);
      console.log('LinkedIn: Messages loaded:', messages);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      console.error('LinkedIn: Error loading messages:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load messages' });
    }
  }, [token]);


  // Change chat
  const changeChat = useCallback(async (sessionId: string) => {
    if (!token) return;
    
    console.log('LinkedIn: changeChat called with sessionId:', sessionId);
    console.log('LinkedIn: Current session before switch:', state.currentSession?.session_id);
    
    try {
      dispatch({ type: 'SET_SWITCHING_SESSION', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const session = await linkedInApi.changeChat(token, { session_id: sessionId });
      console.log('LinkedIn: Session switched to:', session);
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
      dispatch({ type: 'UPDATE_SESSION_IN_PAGES', payload: session });
      
      // Load messages for the new session
      await loadMessages();
    } catch (error) {
      console.error('LinkedIn: Error changing chat:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to change chat' });
    } finally {
      dispatch({ type: 'SET_SWITCHING_SESSION', payload: false });
    }
  }, [token, loadMessages, state.currentSession]);

  // Delete chat
  const deleteChat = useCallback(async (sessionId: string) => {
    if (!token) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const deletedSession = await linkedInApi.deleteChat(token, { session_id: sessionId });
      dispatch({ type: 'UPDATE_SESSION_IN_PAGES', payload: deletedSession });
      
      // If we deleted the current session, clear it
      if (state.currentSession?.session_id === sessionId) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
      }
      
      // Reload pages to get updated list
      await loadPages();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete chat' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, state.currentSession]);

  // Create campaign
  const createCampaign = useCallback(async (params: CreateCampaignParams) => {
    if (!token) return;
    
    try {
      dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await linkedInApi.createCampaign(token, params);
      
      // Reload pages to get the new campaign
      await loadPages();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create campaign' });
    } finally {
      dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: false });
    }
  }, [token]);

  // Load pages
  const loadPages = useCallback(async () => {
    if (!token) {
      console.log('LinkedIn: No token available for loadPages');
      return;
    }
    
    try {
      console.log('LinkedIn: Loading pages with token:', token.substring(0, 20) + '...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const pages = await linkedInApi.getPages(token);
      
      // Parse JSON strings in records (Xano JSON_AGG returns strings)
      const parsedPages = pages.map(page => {
        let records = page.records;
        if (typeof page.records === 'string') {
          try {
            records = JSON.parse(page.records);
          } catch (error) {
            console.error('LinkedIn: Failed to parse records JSON:', error);
            records = [];
          }
        }
        return {
          ...page,
          records
        };
      });
      
      dispatch({ type: 'SET_PAGES', payload: parsedPages });
      
      // If no campaigns exist, create a default one
      if (parsedPages.length === 0) {
        console.log('LinkedIn: No campaigns found, creating default campaign...');
        try {
          await linkedInApi.createCampaign(token, { name: 'Single Posts' });
          console.log('LinkedIn: Default campaign created, reloading pages...');
          // Reload pages to get the new campaign
          const updatedPages = await linkedInApi.getPages(token);
          const updatedParsedPages = updatedPages.map(page => {
            let records = page.records;
            if (typeof page.records === 'string') {
              try {
                records = JSON.parse(page.records);
              } catch (error) {
                console.error('LinkedIn: Failed to parse records JSON:', error);
                records = [];
              }
            }
            return {
              ...page,
              records
            };
          });
          dispatch({ type: 'SET_PAGES', payload: updatedParsedPages });
        } catch (campaignError) {
          console.error('LinkedIn: Failed to create default campaign:', campaignError);
        }
      }
    } catch (error) {
      console.error('LinkedIn: Error loading pages:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load pages' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token]);

  // Send message
  const sendMessage = useCallback(async (prompt: string) => {
    if (!token || !prompt.trim()) return;
    
    console.log('LinkedIn: sendMessage called with state:', {
      currentSession: state.currentSession,
      isLoading: state.isLoading,
      pagesCount: state.pages.length
    });
    
    
    try {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      
      // Add user message immediately for better UX
      const userMessage: LinkedInMessage = {
        id: Date.now(), // Temporary ID
        created_at: Date.now(),
        session_id: state.currentSession?.session_id || '',
        role: 'user',
        content: prompt,
        user_id: user?.id || 0,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      
      const response = await linkedInApi.sendMessage(token, { prompt });
      
      // Add AI response
      const aiMessage: LinkedInMessage = {
        id: Date.now() + 1, // Temporary ID
        created_at: Date.now() + 1,
        session_id: state.currentSession?.session_id || '',
        role: 'ai',
        content: response,
        user_id: user?.id || 0,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      
      // Reload messages to get the actual IDs from the server
      await loadMessages();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to send message' });
    } finally {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
    }
  }, [token, user, state.currentSession, loadMessages, createCampaign]);

  // Auto-load pages when user is authenticated and context is mounted
  useEffect(() => {
    console.log('LinkedIn: useEffect triggered - user:', !!user, 'token:', !!token);
    if (user && token && state.pages.length === 0) {
      console.log('LinkedIn: Auto-loading pages...');
      loadPages();
    }
  }, [user, token, loadPages, state.pages.length]);

  const value: LinkedInContextType = {
    state,
    changeChat,
    deleteChat,
    createCampaign,
    loadPages,
    sendMessage,
    loadMessages,
    clearError,
  };

  return (
    <LinkedInContext.Provider value={value}>
      {children}
    </LinkedInContext.Provider>
  );
}

// Hook to use LinkedIn context
export function useLinkedIn() {
  const context = useContext(LinkedInContext);
  if (context === undefined) {
    throw new Error('useLinkedIn must be used within a LinkedInProvider');
  }
  return context;
}
