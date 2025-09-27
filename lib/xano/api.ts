import { getApiUrl, getAuthHeaders, XANO_CONFIG } from './config';
import type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials 
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


export { XanoApiError };
