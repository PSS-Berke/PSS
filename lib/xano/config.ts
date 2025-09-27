// Xano Configuration
export const XANO_CONFIG = {
  // These will be set via environment variables
  BASE_URL: process.env.NEXT_PUBLIC_XANO_BASE_URL || 'https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf',
  API_KEY: process.env.NEXT_PUBLIC_XANO_API_KEY || '',
  
  // API Endpoints - configured for your Xano setup
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signup',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${XANO_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get headers with auth token
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-Key': XANO_CONFIG.API_KEY,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};
