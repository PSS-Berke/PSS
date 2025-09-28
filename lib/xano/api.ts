import { getApiUrl, getLinkedInApiUrl, getSocialApiUrl, getAuthHeaders, XANO_CONFIG } from './config';
import type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  LinkedInSession,
  LinkedInMessage,
  CampaignPage,
  CreateCampaignParams,
  SendMessageRequest,
  ChangeChatRequest,
  DeleteChatRequest,
  SocialPost,
  SocialPostPayload,
  SocialPostUpdatePayload
} from './types';

class XanoApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'XanoApiError';
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  // Check if API key is configured
  if (!XANO_CONFIG.API_KEY) {
    throw new XanoApiError(
      'Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.',
      401,
      { message: 'API key missing' }
    );
  }

  const url = getApiUrl(endpoint);
  const headers = getAuthHeaders(token);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle specific error cases
    if (response.status === 404) {
      throw new XanoApiError(
        'API endpoint not found. Please create the required authentication endpoints in your Xano workspace.',
        response.status,
        errorData
      );
    }
    
    if (response.status === 403) {
      throw new XanoApiError(
        'Invalid credentials or insufficient permissions. Please check your API key and endpoint configuration.',
        response.status,
        errorData
      );
    }
    
    throw new XanoApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<{ authToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    // For now, we'll create a minimal user object since the API only returns the token
    // In a real app, you might want to decode the JWT to get user info or call /auth/me
    return {
      user: {
        id: 0,
        email: credentials.email,
        name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token: response.authToken,
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiRequest<{ authToken: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    // For now, we'll create a minimal user object since the API only returns the token
    return {
      user: {
        id: 0,
        email: credentials.email,
        name: credentials.name,
        company: credentials.company,
        company_code: credentials.company_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token: response.authToken,
    };
  },

  async logout(token: string): Promise<void> {
    return apiRequest<void>(
      '/auth/logout',
      {
        method: 'POST',
      },
      token
    );
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
  },

  async getMe(token: string): Promise<User> {
    return apiRequest<User>(
      '/auth/me',
      {
        method: 'GET',
      },
      token
    );
  },
};

// Users API
export const usersApi = {
  async getProfile(token: string): Promise<User> {
    return apiRequest<User>(
      '/users/profile',
      {
        method: 'GET',
      },
      token
    );
  },

  async updateProfile(token: string, data: Partial<User>): Promise<User> {
    return apiRequest<User>(
      '/users/update',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },
};


// LinkedIn Copilot API
export const linkedInApi = {
  async createCampaign(token: string, params: CreateCampaignParams = {}): Promise<User> {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.additional_notes) queryParams.append('additional_notes', params.additional_notes);
    if (params.tone) queryParams.append('tone', params.tone);
    if (params.content_length) queryParams.append('content_length', params.content_length.toString());
    if (params.marketing_type) queryParams.append('marketing_type', params.marketing_type);

    const endpoint = `${XANO_CONFIG.ENDPOINTS.LINKEDIN.NEW_CAMPAIGN}?${queryParams.toString()}`;
    const url = getLinkedInApiUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },


  async sendMessage(token: string, data: SendMessageRequest): Promise<string> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.SEND_MESSAGE);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async getMessages(token: string): Promise<LinkedInMessage[]> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.GET_MESSAGES);
    const headers = getAuthHeaders(token);
    
    console.log('LinkedIn API: getMessages URL:', url);
    console.log('LinkedIn API: getMessages headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('LinkedIn API: getMessages response status:', response.status);
    console.log('LinkedIn API: getMessages response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('LinkedIn API: getMessages error:', errorData);
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log('LinkedIn API: getMessages response data:', data);
    return data;
  },

  async getPages(token: string): Promise<CampaignPage[]> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.GET_PAGES);
    const headers = getAuthHeaders(token);
    
    console.log('LinkedIn API: getPages URL:', url);
    console.log('LinkedIn API: getPages headers:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('LinkedIn API: getPages response status:', response.status);
    console.log('LinkedIn API: getPages response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('LinkedIn API: getPages error:', errorData);
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log('LinkedIn API: getPages response data:', data);
    return data;
  },

  async changeChat(token: string, data: ChangeChatRequest): Promise<LinkedInSession> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.CHANGE_CHAT);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async deleteChat(token: string, data: DeleteChatRequest): Promise<LinkedInSession> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.DELETE_CHAT);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },
};

// Social Media Copilot API
export const socialCopilotApi = {
  async getPosts(token: string): Promise<SocialPost[]> {
    const url = getSocialApiUrl(XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async createPost(token: string, data: SocialPostPayload): Promise<SocialPost> {
    const url = getSocialApiUrl(XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async updatePost(token: string, postId: number, data: SocialPostUpdatePayload): Promise<SocialPost> {
    const url = getSocialApiUrl(`${XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS}/${postId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async deletePost(token: string, postId: number): Promise<void> {
    const url = getSocialApiUrl(`${XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS}/${postId}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
  },
};

export { XanoApiError };
