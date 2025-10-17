import { getApiUrl, getLinkedInApiUrl, getSocialApiUrl, getBattleCardApiUrl, getAuthHeaders, XANO_CONFIG } from './config';

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
  SocialPostUpdatePayload,
  BattleCard,
  CreateBattleCardRequest,
  BattleCardListItem,
  Company
} from './types';

export class XanoApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = 'XanoApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
  skipApiKey: boolean = false
): Promise<T> {
  if (!skipApiKey && !XANO_CONFIG.API_KEY) {
    throw new XanoApiError(
      'Xano API key not configured. Please set NEXT_PUBLIC_XANO_API_KEY in your environment variables.',
      401,
      { message: 'API key missing' }
    );
  }

  const url = getApiUrl(endpoint);
  const headers = skipApiKey ? { 'Content-Type': 'application/json' } : getAuthHeaders(token);

  try {
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
  } catch (error) {
    if (error instanceof XanoApiError) {
      throw error;
    }
    throw new XanoApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
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

  async switchCompany(token: string, companyId: number): Promise<void> {
    console.log('=== SWITCH COMPANY API CALL START ===');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('Company ID to switch to:', companyId);
    console.log('Company ID type:', typeof companyId);

    // Try sending as query parameter instead of body
    const urlWithParams = `${getApiUrl('/auth/switch_company')}?company_id=${companyId}`;
    console.log('Full URL with query params:', urlWithParams);

    try {
      // Try with query parameters instead of body
      const response = await fetch(urlWithParams, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ SWITCH COMPANY API CALL FAILED');
        console.error('Status:', response.status);
        console.error('Response:', errorData);
        throw new XanoApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const result = await response.json().catch(() => ({}));
      console.log('✅ Switch company API call succeeded');
      console.log('Response:', result);
      return result;
    } catch (error) {
      console.error('❌ SWITCH COMPANY API CALL FAILED');
      console.error('Error object:', error);
      throw error;
    }
  },

  async getGoogleAuthUrl(redirectUri: string): Promise<{ authUrl: string }> {
    const response = await fetch(`https://xnpm-iauo-ef2d.n7e.xano.io/api:U0aE1wpF/oauth/google/init?redirect_uri=${encodeURIComponent(redirectUri)}`, {
      method: 'GET',
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

  async continueGoogleAuth(code: string, redirectUri: string): Promise<{ name: string; email: string; token: string }> {
    const response = await fetch(`https://xnpm-iauo-ef2d.n7e.xano.io/api:U0aE1wpF/oauth/google/continue?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
      method: 'GET',
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

  async onboardCompany(token: string, data: { company: string; company_code?: number }): Promise<User> {
    return apiRequest<User>(
      '/company',
      {
        method: 'POST',
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

// Decode newlines from backend response
const decodePostContent = (post: SocialPost): SocialPost => {
  return {
    ...post,
    content: post.content?.replace(/<<NEWLINE>>/g, '\n') ?? post.content,
    rich_content_text: post.rich_content_text?.replace(/<<NEWLINE>>/g, '\n') ?? post.rich_content_text,
  };
};

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

  // Encode newlines to preserve them through the API
  // Replace \n with <<NEWLINE>> marker that backend can decode
  const encodedContent = fallbackContent.replace(/\n/g, '<<NEWLINE>>');

  const requestPayload = {
    post_id: postId ?? (data as { post_id?: number }).post_id ?? 0,
    post_title: data.post_title ?? '',
    post_descrription: fallbackDescription,
    post_content: encodedContent,
    url_1: data.url_1 ?? '',
    url_2: data.url_2 ?? '',
    image: data.image ?? null,
    content_type: data.content_type ?? '',
    scheduled_date: normalizedScheduledDate,
    published: data.published ?? false,
    status: data.status ?? 'draft',
  };

  console.log('buildSocialPostRequestBody - Final payload:');
  console.log('post_content (original):', JSON.stringify(fallbackContent));
  console.log('post_content (encoded):', JSON.stringify(requestPayload.post_content));
  console.log('post_descrription:', JSON.stringify(requestPayload.post_descrription));
  console.log('image:', data.image ? 'Image included' : 'null');

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

    const posts: SocialPost[] = await response.json();
    return posts.map(decodePostContent);
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

    const post: SocialPost = await response.json();
    return decodePostContent(post);
  },

  async updatePost(token: string, postId: number, data: SocialPostUpdatePayload): Promise<SocialPost> {
    const url = getSocialApiUrl(`${XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS}/${postId}`);
    const requestBody = buildSocialPostRequestBody(data, postId);

    console.log('Social API: updatePost request body:', requestBody);

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

    const result: SocialPost = await response.json();
    console.log('Social API: updatePost response:', result);
    return decodePostContent(result);
  },

  async getPost(token: string, postId: number): Promise<SocialPost> {
    const url = getSocialApiUrl(`${XANO_CONFIG.ENDPOINTS.SOCIAL.POSTS}/${postId}`);

    console.log('Social API: getPost URL:', url);
    console.log('Social API: getPost postId:', postId);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    console.log('Social API: getPost response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Social API: getPost error:', errorData);
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const result: SocialPost = await response.json();
    console.log('Social API: getPost response:', result);
    return decodePostContent(result);
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

  async postToTwitter(
    company_id: number,
    token: string,
    content: string,
    imageData?: string | null,
    imageName?: string | null,
    url?: string | null,

  ): Promise<any> {
    const apiUrl = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:pEDfedqJ/tweet';

    // Extract MIME type from base64 data URI (e.g., "data:image/png;base64,...")
    const getImageType = (base64String: string | null | undefined): string => {
      if (!base64String) return 'image/png';
      const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
      return match && match[1] ? match[1] : 'image/png';
    };

    // Calculate file size from base64 string
    const getImageSize = (base64String: string | null | undefined): number => {
      if (!base64String) return 0;

      // Remove the data URI prefix
      const base64Data = base64String.split(',')[1] || base64String;

      // Calculate size: base64 is ~33% larger than binary
      // Size = (base64Length * 3) / 4, accounting for padding
      const paddingCount = (base64Data.match(/=/g) || []).length;
      const base64Length = base64Data.length;

      return Math.floor((base64Length * 3) / 4) - paddingCount;
    };


    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        company_id: company_id,
        image: imageData ? {
          path: imageData,
          name: imageName || 'image.png',
          type: getImageType(imageData),
          mime: getImageType(imageData),
          size: getImageSize(imageData),
          meta: {}
        } : null,
        url: url ?? null
      }),
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

// Battle Card Copilot API
export const battleCardApi = {
  async getBattleCardsList(token: string): Promise<BattleCardListItem[]> {
    const url = getBattleCardApiUrl(XANO_CONFIG.ENDPOINTS.BATTLE_CARD.GET_CARDS_LIST);
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

  async getBattleCardDetail(token: string, battleCardId: number): Promise<BattleCard> {
    const url = getBattleCardApiUrl(`${XANO_CONFIG.ENDPOINTS.BATTLE_CARD.CARD_DETAIL}?battle_card_id=${battleCardId}`);

    console.log('BattleCard API: getBattleCardDetail URL:', url);
    console.log('BattleCard API: getBattleCardDetail battleCardId:', battleCardId);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    console.log('BattleCard API: getBattleCardDetail response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('BattleCard API: getBattleCardDetail error:', errorData);
      throw new XanoApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const rawResult = (await response.json()) as any;
    console.log('BattleCard API: getBattleCardDetail raw response:', rawResult);

    // Normalize possible response shapes from Xano (object | array | { data })
    let record: any = rawResult;
    if (Array.isArray(rawResult)) {
      record = rawResult[0] ?? null;
    } else if (rawResult && typeof rawResult === 'object' && 'data' in rawResult) {
      const data = (rawResult as any).data;
      record = Array.isArray(data) ? data[0] : data;
    }

    if (!record) {
      throw new XanoApiError('Battle card not found', 404);
    }

    // Map alternate backend field names and ensure required fields exist
    const normalized: BattleCard = {
      id: Number(record.id ?? record.battle_card_id ?? 0),
      created_at: record.created_at ?? '',
      competitor_name: record.competitor_name ?? '',
      competitor_service: record.competitor_service ?? record.service_name ?? '',
      company_overview: record.company_overview ?? record.competitor_overview ?? '',
      key_products_services: record.key_products_services ?? record.key_products ?? '',
      recent_news: record.recent_news ?? '',
      target_market_icp: record.target_market_icp ?? '',
      market_positioning: record.market_positioning ?? '',
      weaknesses_gaps: record.weaknesses_gaps ?? '',
      strengths: record.strengths ?? '',
      customer_references: record.customer_references ?? '',
      user_id: Number(record.user_id ?? 0),
    };

    console.log('BattleCard API: getBattleCardDetail normalized:', normalized);
    return normalized;
  },

  async getBattleCards(token: string, userId: number): Promise<BattleCard[]> {
    const url = getBattleCardApiUrl(`${XANO_CONFIG.ENDPOINTS.BATTLE_CARD.GET_CARDS}?user_id=${userId}`);
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

  async generateBattleCard(token: string, data: CreateBattleCardRequest, userId: number): Promise<BattleCard> {
    const url = getBattleCardApiUrl(XANO_CONFIG.ENDPOINTS.BATTLE_CARD.GENERATE_CARD);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        ...data,
        user_id: userId,
      }),
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

  async updateBattleCard(token: string, cardId: number, data: Partial<BattleCard>): Promise<BattleCard> {
    const url = getBattleCardApiUrl(XANO_CONFIG.ENDPOINTS.BATTLE_CARD.UPDATE_CARD);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        battle_card_id: cardId,
        ...data,
      }),
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

  async deleteBattleCard(token: string, cardId: number): Promise<void> {
    const url = getBattleCardApiUrl(`${XANO_CONFIG.ENDPOINTS.BATTLE_CARD.DELETE_CARD}/${cardId}`);
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

// Company API
export const companyApi = {
  async getCompanies(token: string): Promise<Company[]> {
    // Use the new company_details endpoint
    const url = XANO_CONFIG.ENDPOINTS.COMPANY.GET_COMPANY_DETAILS;
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

    const data = await response.json();

    // Handle different response formats - Xano might return object or array
    if (Array.isArray(data)) {
      return data;
    }

    // If it's an object, it might be wrapped in a property
    if (data && typeof data === 'object') {
      // Check common wrapper properties
      if (Array.isArray(data.companies)) {
        return data.companies;
      }
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.items)) {
        return data.items;
      }
      // If it's a single object, wrap it in an array
      if (data.company_id || data.id) {
        return [data];
      }
    }

    // Default to empty array if we can't parse the response
    console.warn('Unexpected API response format:', data);
    return [];
  },

  async createCompany(token: string, companyName: string): Promise<Company> {
    const url = getApiUrl(XANO_CONFIG.ENDPOINTS.COMPANY.CREATE_COMPANY);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ company_name: companyName }),
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

  async updateCompany(token: string, companyId: number, companyName: string): Promise<Company> {
    const url = getApiUrl(XANO_CONFIG.ENDPOINTS.COMPANY.UPDATE_COMPANY);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        company_id: companyId,
        company_name: companyName
      }),
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

  async deleteCompany(token: string, companyId: number): Promise<void> {
    const url = getApiUrl(`${XANO_CONFIG.ENDPOINTS.COMPANY.DELETE_COMPANY}/${companyId}`);
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
