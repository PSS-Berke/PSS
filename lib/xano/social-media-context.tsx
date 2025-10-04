'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { socialCopilotApi } from './api';
import type {
  SocialPost,
  SocialPostPayload,
  SocialPostUpdatePayload,
} from './types';
import { useAuth } from './auth-context';

interface SocialMediaState {
  posts: SocialPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  mutatingPostIds: number[];
  lastFetchedAt: string | null;
}

type SocialMediaAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POSTS'; payload: SocialPost[] }
  | { type: 'UPDATE_POST'; payload: SocialPost }
  | { type: 'ADD_POST'; payload: SocialPost }
  | { type: 'REMOVE_POST'; payload: number }
  | { type: 'SET_MUTATING'; payload: { id: number; isMutating: boolean } }
  | { type: 'SET_LAST_FETCHED'; payload: string | null };

const initialState: SocialMediaState = {
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  mutatingPostIds: [],
  lastFetchedAt: null,
};

function socialMediaReducer(
  state: SocialMediaState,
  action: SocialMediaAction
): SocialMediaState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'REMOVE_POST':
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };
    case 'SET_MUTATING': {
      const { id, isMutating } = action.payload;
      const mutatingPostIds = isMutating
        ? Array.from(new Set([...state.mutatingPostIds, id]))
        : state.mutatingPostIds.filter((mutatingId) => mutatingId !== id);
      return { ...state, mutatingPostIds };
    }
    case 'SET_LAST_FETCHED':
      return { ...state, lastFetchedAt: action.payload };
    default:
      return state;
  }
}

interface SocialMediaContextValue {
  state: SocialMediaState;
  refreshPosts: () => Promise<void>;
  togglePublish: (postId: number, nextStatus: boolean) => Promise<void>;
  updateStatus: (postId: number, status: 'draft' | 'approved' | 'published') => Promise<void>;
  updatePost: (
    postId: number,
    payload: SocialPostUpdatePayload
  ) => Promise<void>;
  createPost: (payload: SocialPostPayload) => Promise<SocialPost | null>;
  deletePost: (postId: number) => Promise<void>;
}

const SocialMediaContext = createContext<SocialMediaContextValue | undefined>(
  undefined
);

export function SocialMediaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(socialMediaReducer, initialState);
  const { token, user } = useAuth();
  const postsRef = useRef<SocialPost[]>(state.posts);

  // Keep ref updated with latest posts
  useEffect(() => {
    postsRef.current = state.posts;
  }, [state.posts]);

  const fetchPosts = useCallback(async () => {
    if (!token) {
      return;
    }

    const isInitialLoad = state.posts.length === 0;
    dispatch({ type: 'SET_ERROR', payload: null });

    if (isInitialLoad) {
      dispatch({ type: 'SET_LOADING', payload: true });
    } else {
      dispatch({ type: 'SET_REFRESHING', payload: true });
    }

    try {
      const posts = await socialCopilotApi.getPosts(token);
      const sorted = posts
        .slice()
        .sort(
          (a, b) =>
            new Date(a.scheduled_date).getTime() -
            new Date(b.scheduled_date).getTime()
        );
      dispatch({ type: 'SET_POSTS', payload: sorted });
      dispatch({
        type: 'SET_LAST_FETCHED',
        payload: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Social Media: Failed to fetch posts', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to load social media posts',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.posts.length, token]);

  const refreshPosts = useCallback(async () => {
    await fetchPosts();
  }, [fetchPosts]);

  const updateStatus = useCallback(
    async (postId: number, newStatus: 'draft' | 'approved' | 'published') => {
      if (!token) return;

      dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: true } });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // Use ref to get current posts without adding to dependencies
        const currentPost = postsRef.current.find(post => post.id === postId);
        if (!currentPost) {
          throw new Error('Post not found');
        }

        // Send full post data with updated status
        const updated = await socialCopilotApi.updatePost(token, postId, {
          post_title: currentPost.post_title,
          post_description: currentPost.post_description ?? '',
          rich_content_text: currentPost.rich_content_text ?? currentPost.content ?? '',
          content: currentPost.content ?? currentPost.rich_content_text ?? '',
          rich_content_html: currentPost.rich_content_html ?? '',
          url_1: currentPost.url_1 ?? '',
          url_2: currentPost.url_2 ?? '',
          content_type: currentPost.content_type,
          scheduled_date: currentPost.scheduled_date,
          published: newStatus === 'published',
          status: newStatus,
        });
        dispatch({ type: 'UPDATE_POST', payload: updated });
      } catch (error) {
        console.error('Social Media: Failed to update status', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to update post status',
        });
      } finally {
        dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: false } });
      }
  }, [token]);

  const togglePublish = useCallback(
    async (postId: number, nextStatus: boolean) => {
      await updateStatus(postId, nextStatus ? 'published' : 'draft');
  }, [updateStatus]);

  const updatePost = useCallback(
    async (postId: number, payload: SocialPostUpdatePayload) => {
      if (!token) return;

      dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: true } });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const updated = await socialCopilotApi.updatePost(token, postId, payload);
        dispatch({ type: 'UPDATE_POST', payload: updated });
      } catch (error) {
        console.error('Social Media: Failed to update post', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to update post',
        });
      } finally {
        dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: false } });
      }
    },
    [token]
  );

  const createPost = useCallback(
    async (payload: SocialPostPayload) => {
      if (!token) return null;

      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const created = await socialCopilotApi.createPost(token, payload);
        dispatch({ type: 'ADD_POST', payload: created });
        return created;
      } catch (error) {
        console.error('Social Media: Failed to create post', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to create post',
        });
        return null;
      }
    },
    [token]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      if (!token) return;

      dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: true } });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        await socialCopilotApi.deletePost(token, postId);
        dispatch({ type: 'REMOVE_POST', payload: postId });
      } catch (error) {
        console.error('Social Media: Failed to delete post', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : 'Failed to delete post',
        });
      } finally {
        dispatch({ type: 'SET_MUTATING', payload: { id: postId, isMutating: false } });
      }
    },
    [token]
  );

  useEffect(() => {
    if (token && user) {
      fetchPosts();
    }
  }, [fetchPosts, token, user]);

  // Refetch data when company changes
  useEffect(() => {
    if (user?.company_id && token) {
      console.log('Social Media: Company changed, reloading posts for company:', user.company_id);
      fetchPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id]);

  const value: SocialMediaContextValue = {
    state,
    refreshPosts,
    togglePublish,
    updateStatus,
    updatePost,
    createPost,
    deletePost,
  };

  return (
    <SocialMediaContext.Provider value={value}>
      {children}
    </SocialMediaContext.Provider>
  );
}

export function useSocialMedia(): SocialMediaContextValue {
  const context = useContext(SocialMediaContext);
  if (context === undefined) {
    throw new Error('useSocialMedia must be used within a SocialMediaProvider');
  }
  return context;
}

