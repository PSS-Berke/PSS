// People Data Labs API Configuration

export const PDL_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_PEOPLEDATALABS_API_KEY || '',
  BASE_URL: 'https://api.peopledatalabs.com/v5',
  ENDPOINTS: {
    PERSON_ENRICH: '/person/enrich',
    COMPANY_ENRICH: '/company/enrich',
    PERSON_SEARCH: '/person/search',
    COMPANY_SEARCH: '/company/search',
  },
} as const;

// Debug logging
console.log('PDL_CONFIG.API_KEY:', PDL_CONFIG.API_KEY ? 'Present (length: ' + PDL_CONFIG.API_KEY.length + ')' : 'Missing');

export function getPDLHeaders(): HeadersInit {
  if (!PDL_CONFIG.API_KEY) {
    console.error('People Data Labs API key not configured! Please restart your dev server after adding NEXT_PUBLIC_PEOPLEDATALABS_API_KEY to .env.local');
  }

  return {
    'Content-Type': 'application/json',
    'X-API-Key': PDL_CONFIG.API_KEY,
  };
}

export function getPDLUrl(endpoint: string): string {
  return `${PDL_CONFIG.BASE_URL}${endpoint}`;
}
