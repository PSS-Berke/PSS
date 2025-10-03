import { getApiUrl, getLinkedInApiUrl, getSocialApiUrl, getAuthHeaders, XANO_CONFIG } from './config';
import type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  LinkedInSession,
  LinkedInMessage,
  LinkedInCampaign,
  LinkedInCampaignDetails,
  CampaignPage,
  CreateCampaignParams,
  SendMessageRequest,
  ChangeChatRequest,
  DeleteChatRequest,
  EditChatNameRequest,
  InitiateSessionRequest,
  EditCampaignPayload,
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
  token?: string,
  skipApiKey: boolean = false
): Promise<T> {
  // Check if API key is configured (skip for public endpoints like login/register)
  if (!skipApiKey && !XANO_CONFIG.API_KEY) {
    throw new XanoApiError(
      'Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.',
      401,
      { message: 'API key missing' }
    );
  }

  const url = getApiUrl(endpoint);
  const headers = skipApiKey
    ? { 'Content-Type': 'application/json' }
    : getAuthHeaders(token);

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
      },
      undefined,
      true // Skip API key for public login endpoint
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
      },
      undefined,
      true // Skip API key for public register endpoint
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
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.NEW_CAMPAIGN);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(params),
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

  async editChatName(token: string, data: EditChatNameRequest): Promise<LinkedInSession> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.EDIT_CHAT_NAME);

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

  async initiateSession(token: string, data: InitiateSessionRequest): Promise<LinkedInSession> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.INITIATE_SESSION);

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

  async editCampaign(token: string, data: EditCampaignPayload): Promise<LinkedInCampaign> {
    const url = getLinkedInApiUrl(XANO_CONFIG.ENDPOINTS.LINKEDIN.EDIT_CAMPAIGN);

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

  async getCampaignDetails(token: string, campaignId: number): Promise<LinkedInCampaignDetails> {
    const endpoint = `${XANO_CONFIG.ENDPOINTS.LINKEDIN.CAMPAIGN_DETAILS}?campaign_id=${campaignId}`;
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
};

type SocialPostRequestData = SocialPostPayload | SocialPostUpdatePayload;

const buildSocialPostRequestBody = (
  data: SocialPostRequestData,
  postId?: number
) => {
  const normalizedScheduledDate = (() => {
    if (!data.scheduled_date) {
      return null;
    }
    const date = new Date(data.scheduled_date);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  })();

  const fallbackDescription =
    (data as Partial<SocialPostPayload> & { post_descrription?: string })
      .post_descrription ?? data.post_description ?? '';

  const fallbackContent =
    (data as Partial<SocialPostPayload> & { post_content?: string }).post_content ??
    data.content ??
    data.rich_content_text ??
    fallbackDescription ??
    '';

  const requestPayload = {
    post_id: postId ?? (data as { post_id?: number }).post_id ?? 0,
    post_title: data.post_title ?? '',
    post_descrription: fallbackDescription,
    post_content: fallbackContent,
    url_1: data.url_1 ?? '',
    url_2: data.url_2 ?? '',
    content_type: data.content_type ?? '',
    scheduled_date: normalizedScheduledDate,
  };

  return requestPayload;
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
    const requestBody = buildSocialPostRequestBody(data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(requestBody),
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
    const requestBody = buildSocialPostRequestBody(data, postId);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(requestBody),
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
