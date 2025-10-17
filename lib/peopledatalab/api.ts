import { getPDLHeaders, getPDLUrl, PDL_CONFIG } from './config';
import type {
  PDLPersonEnrichParams,
  PDLPersonEnrichResponse,
  PDLCompanyEnrichParams,
  PDLCompanyEnrichResponse,
  PDLErrorResponse,
} from './types';

export class PDLApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'PDLApiError';
  }
}

async function pdlRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  if (!PDL_CONFIG.API_KEY) {
    throw new PDLApiError(
      'People Data Labs API key not configured. Please set NEXT_PUBLIC_PEOPLEDATALABS_API_KEY in your environment variables.',
      401,
      { message: 'API key missing' },
    );
  }

  const url = getPDLUrl(endpoint);

  // Build query string from params (remove undefined/null values)
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const fullUrl = `${url}?${queryParams.toString()}`;

  try {
    console.log('PDL API: Making request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getPDLHeaders(),
    });

    console.log('PDL API: Response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as PDLErrorResponse;
      throw new PDLApiError(
        errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof PDLApiError) {
      throw error;
    }
    throw new PDLApiError(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Person Enrichment API
export const pdlPersonApi = {
  async enrichByProfile(linkedinUrl: string): Promise<PDLPersonEnrichResponse> {
    return pdlRequest<PDLPersonEnrichResponse>(PDL_CONFIG.ENDPOINTS.PERSON_ENRICH, {
      profile: linkedinUrl,
      pretty: true,
    });
  },

  async enrichByName(params: {
    name?: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    location?: string;
  }): Promise<PDLPersonEnrichResponse> {
    return pdlRequest<PDLPersonEnrichResponse>(PDL_CONFIG.ENDPOINTS.PERSON_ENRICH, {
      ...params,
      pretty: true,
      min_likelihood: 6, // Minimum confidence score
    });
  },

  async enrichByEmail(email: string): Promise<PDLPersonEnrichResponse> {
    return pdlRequest<PDLPersonEnrichResponse>(PDL_CONFIG.ENDPOINTS.PERSON_ENRICH, {
      email,
      pretty: true,
    });
  },

  async enrichByLinkedInId(linkedinId: string): Promise<PDLPersonEnrichResponse> {
    return pdlRequest<PDLPersonEnrichResponse>(PDL_CONFIG.ENDPOINTS.PERSON_ENRICH, {
      lid: linkedinId,
      pretty: true,
    });
  },

  async enrich(params: PDLPersonEnrichParams): Promise<PDLPersonEnrichResponse> {
    return pdlRequest<PDLPersonEnrichResponse>(PDL_CONFIG.ENDPOINTS.PERSON_ENRICH, {
      ...params,
      pretty: true,
      min_likelihood: params.min_likelihood || 6,
    });
  },
};

// Company Enrichment API
export const pdlCompanyApi = {
  async enrichByName(companyName: string): Promise<PDLCompanyEnrichResponse> {
    return pdlRequest<PDLCompanyEnrichResponse>(PDL_CONFIG.ENDPOINTS.COMPANY_ENRICH, {
      name: companyName,
      pretty: true,
    });
  },

  async enrichByWebsite(website: string): Promise<PDLCompanyEnrichResponse> {
    return pdlRequest<PDLCompanyEnrichResponse>(PDL_CONFIG.ENDPOINTS.COMPANY_ENRICH, {
      website,
      pretty: true,
    });
  },

  async enrichByProfile(linkedinUrl: string): Promise<PDLCompanyEnrichResponse> {
    return pdlRequest<PDLCompanyEnrichResponse>(PDL_CONFIG.ENDPOINTS.COMPANY_ENRICH, {
      profile: linkedinUrl,
      pretty: true,
    });
  },

  async enrich(params: PDLCompanyEnrichParams): Promise<PDLCompanyEnrichResponse> {
    return pdlRequest<PDLCompanyEnrichResponse>(PDL_CONFIG.ENDPOINTS.COMPANY_ENRICH, {
      ...params,
      pretty: true,
      min_likelihood: params.min_likelihood || 6,
    });
  },
};

// Helper function to extract company name from text
export function extractCompanyName(text: string): string | null {
  // Try to extract company name from various formats
  // This is a simple implementation - you may want to enhance it

  // Look for patterns like "Company: XYZ" or "at XYZ"
  const patterns = [
    /company:\s*([^,.\n]+)/i,
    /at\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+is|\s+has|\.|,|\n)/,
    /^([A-Z][a-zA-Z0-9\s&]+?)(?:\s+is|\s+has)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

// Helper function to extract person names from text
export function extractPersonNames(text: string): string[] {
  // This is a simple implementation - extracts capitalized names
  // You may want to use a more sophisticated NLP library for better results

  const names: string[] = [];

  // Split by common separators
  const lines = text.split(/[,;\n]/);

  for (const line of lines) {
    // Look for patterns like "John Doe (Title)" or "John Doe - Title"
    const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
    const matches = line.matchAll(namePattern);

    for (const match of matches) {
      const name = match[1].trim();
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
  }

  return names;
}
