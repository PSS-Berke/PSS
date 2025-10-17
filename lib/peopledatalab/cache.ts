// PDL Cache API - Xano Integration
import { getAuthHeaders } from '@/lib/xano/config';
import type { PDLPersonProfile, PDLCompanyProfile } from './types';

const PDL_CACHE_BASE_URL = 'https://xnpm-iauo-ef2d.n7e.xano.io/api:S52ihqAl';

interface CachedPersonRecord {
  id: number;
  user_id: number;
  company_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  search_company_name: string | null;
  pdl_data: PDLPersonProfile;
  likelihood: number;
  created_at: string;
  updated_at: string;
}

interface CachedCompanyRecord {
  id: number;
  user_id: number;
  company_id: number;
  company_name: string;
  pdl_data: PDLCompanyProfile;
  likelihood: number;
  created_at: string;
  updated_at: string;
}

// Person Cache Functions
export async function lookupPersonCache(
  firstName: string,
  lastName: string,
  companyName?: string,
  token?: string,
): Promise<PDLPersonProfile | null> {
  try {
    const params = new URLSearchParams({
      first_name: firstName,
      last_name: lastName,
    });

    if (companyName) {
      params.append('search_company_name', companyName);
    }

    const response = await fetch(`${PDL_CACHE_BASE_URL}/pdl_person_cache?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      console.log(`Person cache lookup failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Xano GET ALL returns an array, check if we have results
    if (Array.isArray(data) && data.length > 0) {
      const cachedRecord = data[0] as CachedPersonRecord;
      console.log(`✅ Person cache HIT for ${firstName} ${lastName}`);
      return cachedRecord.pdl_data;
    }

    console.log(`❌ Person cache MISS for ${firstName} ${lastName}`);
    return null;
  } catch (error) {
    console.error('Person cache lookup error:', error);
    return null;
  }
}

export async function savePersonCache(
  firstName: string,
  lastName: string,
  fullName: string,
  pdlData: PDLPersonProfile,
  likelihood: number,
  companyName?: string,
  token?: string,
): Promise<void> {
  try {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      search_company_name: companyName || null,
      pdl_data: pdlData,
      likelihood: likelihood,
    };

    const response = await fetch(`${PDL_CACHE_BASE_URL}/pdl_person_cache`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to save person cache: ${response.status}`);
      return;
    }

    console.log(`💾 Saved person cache for ${firstName} ${lastName}`);
  } catch (error) {
    console.error('Person cache save error:', error);
  }
}

// Company Cache Functions
export async function lookupCompanyCache(
  companyName: string,
  token?: string,
): Promise<PDLCompanyProfile | null> {
  try {
    const params = new URLSearchParams({
      company_name: companyName,
    });

    const response = await fetch(`${PDL_CACHE_BASE_URL}/pdl_company_cache?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      console.log(`Company cache lookup failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Xano GET ALL returns an array, check if we have results
    if (Array.isArray(data) && data.length > 0) {
      const cachedRecord = data[0] as CachedCompanyRecord;
      console.log(`✅ Company cache HIT for ${companyName}`);
      return cachedRecord.pdl_data;
    }

    console.log(`❌ Company cache MISS for ${companyName}`);
    return null;
  } catch (error) {
    console.error('Company cache lookup error:', error);
    return null;
  }
}

export async function saveCompanyCache(
  companyName: string,
  pdlData: PDLCompanyProfile,
  likelihood: number,
  token?: string,
): Promise<void> {
  try {
    const payload = {
      company_name: companyName,
      pdl_data: pdlData,
      likelihood: likelihood,
    };

    const response = await fetch(`${PDL_CACHE_BASE_URL}/pdl_company_cache`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to save company cache: ${response.status}`);
      return;
    }

    console.log(`💾 Saved company cache for ${companyName}`);
  } catch (error) {
    console.error('Company cache save error:', error);
  }
}
