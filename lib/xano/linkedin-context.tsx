'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { linkedInApi } from './api';
import type {
  LinkedInSession,
  LinkedInMessage,
  CampaignPage,
  CreateCampaignParams,
  EditCampaignPayload,
  LinkedInCampaignDetails,
} from './types';
import { useAuth } from './auth-context';

const generateSessionId = (length = 15): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    const randomValues = new Uint8Array(length);
    globalThis.crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (value) => characters.charAt(value % characters.length)).join(
      '',
    );
  }

  let result = '';
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

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
  | { type: 'UPDATE_SESSION_IN_PAGES'; payload: LinkedInSession }
  | { type: 'ADD_SESSION_TO_CAMPAIGN'; payload: LinkedInSession }
  | { type: 'UPDATE_CAMPAIGN'; payload: CampaignPage }
  | { type: 'SET_CAMPAIGN_DETAILS'; payload: LinkedInCampaignDetails };

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
        pages: state.pages.map((page) => {
          let records = page.records;
          if (Array.isArray(page.records)) {
            records = page.records.map((session: LinkedInSession) =>
              session.id === action.payload.id ? action.payload : session,
            );
          }
          return {
            ...page,
            records,
          };
        }),
      };
    case 'ADD_SESSION_TO_CAMPAIGN':
      return {
        ...state,
        pages: state.pages.map((page) => {
          if (page.linkedin_campaigns_id === action.payload.linkedin_campaigns_id) {
            const entries = Array.isArray(page.records) ? page.records : [];
            const exists = entries.some((session) => session.id === action.payload.id);
            return {
              ...page,
              records: exists ? entries : [action.payload, ...entries],
            };
          }
          return page;
        }),
      };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.linkedin_campaigns_id === action.payload.linkedin_campaigns_id
            ? {
                ...page,
                ...action.payload,
                records: Array.isArray(action.payload.records)
                  ? action.payload.records
                  : page.records,
              }
            : page,
        ),
      };
    case 'SET_CAMPAIGN_DETAILS':
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.linkedin_campaigns_id === action.payload.id
            ? {
                ...page,
                name: action.payload.name,
                additional_notes: action.payload.additional_notes,
                marketing_type: action.payload.marketing_type,
                post_length: action.payload.post_length,
                tone: action.payload.tone,
                created_at: action.payload.created_at,
              }
            : page,
        ),
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
  editChatName: (sessionId: number, name: string) => Promise<LinkedInSession | null>;
  initiateSession: (campaignId: number | null) => Promise<LinkedInSession | null>;

  // Campaign management
  createCampaign: (params: CreateCampaignParams) => Promise<void>;
  loadPages: () => Promise<void>;
  submitCampaignUpdate: (payload: EditCampaignPayload) => Promise<CampaignPage | null>;
  fetchCampaignDetails: (campaignId: number) => Promise<LinkedInCampaignDetails | null>;

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
  const isLoadingPagesRef = useRef(false);
  const hasInitializedRef = useRef(false);

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
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load messages',
      });
    }
  }, [token]);

  // Load pages
  const loadPages = useCallback(async () => {
    if (isLoadingPagesRef.current) {
      console.log('LinkedIn: loadPages already in progress, skipping duplicate call');
      return;
    }
    isLoadingPagesRef.current = true;

    if (!token) {
      console.log('LinkedIn: No token available for loadPages');
      isLoadingPagesRef.current = false;
      return;
    }

    const parsePageRecords = (rawPages: CampaignPage[]): CampaignPage[] =>
      rawPages.map((page) => {
        let records = page.records;
        if (typeof records === 'string') {
          try {
            records = JSON.parse(records);
          } catch (error) {
            console.error('LinkedIn: Failed to parse records JSON:', error);
            records = [];
          }
        }
        return {
          ...page,
          records,
        };
      });

    const assignActiveSessionFromPages = async (
      pagesData: CampaignPage[],
      currentSessionId: number | null | undefined,
      hasMessages: boolean,
    ) => {
      const activeSession = pagesData.reduce<LinkedInSession | null>((found, page) => {
        if (found) return found;
        const records = Array.isArray(page.records) ? page.records : [];
        return records.find((session) => session.is_enabled && !session.is_deleted) || null;
      }, null);

      const hadCurrentSession = currentSessionId != null;

      if (activeSession) {
        const isSameSession = currentSessionId === activeSession.id;
        dispatch({ type: 'SET_CURRENT_SESSION', payload: activeSession });

        if (!isSameSession || !hasMessages) {
          await loadMessages();
        }
      } else if (hadCurrentSession) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
      }
    };

    try {
      console.log('LinkedIn: Loading pages with token:', token.substring(0, 20) + '...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const pages = await linkedInApi.getPages(token);
      const parsedPages = parsePageRecords(pages);

      dispatch({ type: 'SET_PAGES', payload: parsedPages });
      await assignActiveSessionFromPages(
        parsedPages,
        state.currentSession?.id,
        state.messages.length > 0,
      );
    } catch (error) {
      console.error('LinkedIn: Error loading pages:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load pages',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      isLoadingPagesRef.current = false;
    }
  }, [token, loadMessages, state.currentSession?.id, state.messages.length]);

  // Change chat
  const changeChat = useCallback(
    async (sessionId: string) => {
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
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to change chat',
        });
      } finally {
        dispatch({ type: 'SET_SWITCHING_SESSION', payload: false });
      }
    },
    [token, loadMessages, state.currentSession],
  );

  // Delete chat
  const deleteChat = useCallback(
    async (sessionId: string) => {
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
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to delete chat',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [token, state.currentSession, loadPages],
  );

  const editChatName = useCallback(
    async (sessionId: number, name: string) => {
      if (!token) return null;

      try {
        dispatch({ type: 'SET_ERROR', payload: null });

        const updatedSession = await linkedInApi.editChatName(token, {
          name,
          linkedin_sessions_id: sessionId,
        });

        dispatch({ type: 'UPDATE_SESSION_IN_PAGES', payload: updatedSession });

        if (state.currentSession?.id === updatedSession.id) {
          dispatch({ type: 'SET_CURRENT_SESSION', payload: updatedSession });
        }

        return updatedSession;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update chat name',
        });

        throw error;
      }
    },
    [token, state.currentSession?.id],
  );

  const initiateSession = useCallback(
    async (campaignId: number | null) => {
      if (!token) return null;

      try {
        dispatch({ type: 'SET_SWITCHING_SESSION', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const newSession = await linkedInApi.initiateSession(token, {
          linkedin_campaigns_id: campaignId,
          session_id: generateSessionId(),
        });

        dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
        dispatch({ type: 'ADD_SESSION_TO_CAMPAIGN', payload: newSession });

        await loadMessages();
        await loadPages();
        return newSession;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to add chat to campaign',
        });
        return null;
      } finally {
        dispatch({ type: 'SET_SWITCHING_SESSION', payload: false });
      }
    },
    [token, loadMessages, loadPages],
  );

  // Create campaign
  const createCampaign = useCallback(
    async (params: CreateCampaignParams) => {
      if (!token) return;

      try {
        dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        await linkedInApi.createCampaign(token, params);

        // Reload pages to get the new campaign
        await loadPages();
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to create campaign',
        });
      } finally {
        dispatch({ type: 'SET_CREATING_CAMPAIGN', payload: false });
      }
    },
    [token, loadPages],
  );

  // Send message
  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!token || !prompt.trim()) return;

      console.log('LinkedIn: sendMessage called with state:', {
        currentSession: state.currentSession,
        isLoading: state.isLoading,
        pagesCount: state.pages.length,
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
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to send message',
        });
      } finally {
        dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      }
    },
    [token, user, state.currentSession, state.isLoading, state.pages.length, loadMessages],
  );

  // Auto-load pages when user is authenticated and context is mounted
  useEffect(() => {
    console.log(
      'LinkedIn: useEffect triggered - user:',
      !!user,
      'token:',
      !!token,
      'company_id:',
      user?.company_id,
    );
    if (user && token && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      console.log('LinkedIn: Auto-loading pages...');
      loadPages();
    }

    if (!user || !token) {
      hasInitializedRef.current = false;
      isLoadingPagesRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // Refetch data when company changes
  useEffect(() => {
    if (user?.company_id && token && hasInitializedRef.current) {
      console.log(
        'LinkedIn: Company changed, clearing session and reloading pages for company:',
        user.company_id,
      );
      // Clear current session and messages when switching companies
      dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      loadPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id]);

  const fetchCampaignDetails = useCallback(
    async (campaignId: number) => {
      if (!token) return null;

      try {
        const details = await linkedInApi.getCampaignDetails(token, campaignId);

        dispatch({ type: 'SET_CAMPAIGN_DETAILS', payload: details });

        return details;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load campaign details',
        });
        return null;
      }
    },
    [token],
  );

  const submitCampaignUpdate = useCallback(
    async (payload: EditCampaignPayload) => {
      if (!token) return null;

      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        const updatedCampaign = await linkedInApi.editCampaign(token, payload);

        const mappedCampaign: CampaignPage = {
          linkedin_campaigns_id: updatedCampaign.id,
          name: updatedCampaign.name,
          additional_notes: updatedCampaign.additional_notes,
          marketing_type: updatedCampaign.marketing_type,
          post_length: updatedCampaign.post_length,
          tone: updatedCampaign.tone,
          records: [],
        };

        dispatch({ type: 'UPDATE_CAMPAIGN', payload: mappedCampaign });
        await loadPages();
        return mappedCampaign;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update campaign',
        });
        return null;
      }
    },
    [token, loadPages],
  );

  const value: LinkedInContextType = {
    state,
    changeChat,
    deleteChat,
    editChatName,
    initiateSession,
    createCampaign,
    loadPages,
    submitCampaignUpdate,
    fetchCampaignDetails,
    sendMessage,
    loadMessages,
    clearError,
  };

  return <LinkedInContext.Provider value={value}>{children}</LinkedInContext.Provider>;
}

// Hook to use LinkedIn context
export function useLinkedIn() {
  const context = useContext(LinkedInContext);
  if (context === undefined) {
    throw new Error('useLinkedIn must be used within a LinkedInProvider');
  }
  return context;
}
