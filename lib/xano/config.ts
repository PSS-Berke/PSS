// Xano Configuration
export const XANO_CONFIG = {
  // These will be set via environment variables
  BASE_URL: process.env.NEXT_PUBLIC_XANO_BASE_URL || 'https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf',
  LINKEDIN_BASE_URL: process.env.NEXT_PUBLIC_LINKEDIN_API_URL || 'https://xnpm-iauo-ef2d.n7e.xano.io/api:fVcTh-PR',
  API_KEY: process.env.NEXT_PUBLIC_XANO_API_KEY || '',
  
  // API Endpoints - configured for your Xano setup
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signup',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    LINKEDIN: {
      NEW_CAMPAIGN: '/new_campaign',
      SEND_MESSAGE: '/send_message',
      GET_MESSAGES: '/get_messages',
      GET_PAGES: '/get_pages',
      CHANGE_CHAT: '/change_chat',
      DELETE_CHAT: '/delete_chat',
    },
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${XANO_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get LinkedIn API URL
export const getLinkedInApiUrl = (endpoint: string): string => {
  return `${XANO_CONFIG.LINKEDIN_BASE_URL}${endpoint}`;
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
  
  console.log('LinkedIn Config: API_KEY available:', !!XANO_CONFIG.API_KEY);
  console.log('LinkedIn Config: Token provided:', !!token);
  console.log('LinkedIn Config: Headers:', headers);
  
  return headers;
};
