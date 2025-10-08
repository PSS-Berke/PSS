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

export function getPDLHeaders(): HeadersInit {
  if (!PDL_CONFIG.API_KEY) {
    console.warn('People Data Labs API key not configured');
  }

  return {
    'Content-Type': 'application/json',
    'X-API-Key': PDL_CONFIG.API_KEY,
  };
}

export function getPDLUrl(endpoint: string): string {
  return `${PDL_CONFIG.BASE_URL}${endpoint}`;
}
