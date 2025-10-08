// PDL LocalStorage Cache Layer
import type { PDLPersonProfile, PDLCompanyProfile } from './types';

const CACHE_PREFIX = 'pdl_cache_';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_DAYS = 30; // Cache expires after 30 days

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  companyId: number;
  version: string;
}

function getCacheKey(type: 'person' | 'company', identifier: string, companyId: number): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${type}_${companyId}_${identifier.toLowerCase().replace(/\s+/g, '_')}`;
}

function isExpired(timestamp: number): boolean {
  const now = Date.now();
  const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return (now - timestamp) > expiryMs;
}

// Person Cache Functions
export function getPersonFromLocalStorage(
  firstName: string,
  lastName: string,
  companyId: number,
  searchCompany?: string
): PDLPersonProfile | null {
  if (typeof window === 'undefined') return null; // Server-side rendering check

  try {
    const identifier = searchCompany
      ? `${firstName}_${lastName}_${searchCompany}`
      : `${firstName}_${lastName}`;

    const cacheKey = getCacheKey('person', identifier, companyId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      console.log(`📦 localStorage MISS for person: ${firstName} ${lastName}`);
      return null;
    }

    const entry: CacheEntry<PDLPersonProfile> = JSON.parse(cached);

    // Check if expired
    if (isExpired(entry.timestamp)) {
      console.log(`⏰ localStorage EXPIRED for person: ${firstName} ${lastName}`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Check if company matches (security check)
    if (entry.companyId !== companyId) {
      console.log(`🚫 localStorage company mismatch for: ${firstName} ${lastName}`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`✅ localStorage HIT for person: ${firstName} ${lastName}`);
    return entry.data;
  } catch (error) {
    console.error('localStorage read error:', error);
    return null;
  }
}

export function savePersonToLocalStorage(
  firstName: string,
  lastName: string,
  companyId: number,
  data: PDLPersonProfile,
  searchCompany?: string
): void {
  if (typeof window === 'undefined') return; // Server-side rendering check

  try {
    const identifier = searchCompany
      ? `${firstName}_${lastName}_${searchCompany}`
      : `${firstName}_${lastName}`;

    const cacheKey = getCacheKey('person', identifier, companyId);
    const entry: CacheEntry<PDLPersonProfile> = {
      data,
      timestamp: Date.now(),
      companyId,
      version: CACHE_VERSION,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`💾 localStorage SAVED person: ${firstName} ${lastName}`);
  } catch (error) {
    console.error('localStorage write error:', error);
    // If quota exceeded, clear old entries
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldLocalStorageEntries();
    }
  }
}

// Company Cache Functions
export function getCompanyFromLocalStorage(
  companyName: string,
  companyId: number
): PDLCompanyProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const cacheKey = getCacheKey('company', companyName, companyId);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      console.log(`📦 localStorage MISS for company: ${companyName}`);
      return null;
    }

    const entry: CacheEntry<PDLCompanyProfile> = JSON.parse(cached);

    // Check if expired
    if (isExpired(entry.timestamp)) {
      console.log(`⏰ localStorage EXPIRED for company: ${companyName}`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Check if company matches
    if (entry.companyId !== companyId) {
      console.log(`🚫 localStorage company mismatch for: ${companyName}`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`✅ localStorage HIT for company: ${companyName}`);
    return entry.data;
  } catch (error) {
    console.error('localStorage read error:', error);
    return null;
  }
}

export function saveCompanyToLocalStorage(
  companyName: string,
  companyId: number,
  data: PDLCompanyProfile
): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheKey = getCacheKey('company', companyName, companyId);
    const entry: CacheEntry<PDLCompanyProfile> = {
      data,
      timestamp: Date.now(),
      companyId,
      version: CACHE_VERSION,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
    console.log(`💾 localStorage SAVED company: ${companyName}`);
  } catch (error) {
    console.error('localStorage write error:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldLocalStorageEntries();
    }
  }
}

// Utility: Clear old cache entries to free up space
function clearOldLocalStorageEntries(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    const pdlKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    // Get entries with timestamps
    const entries = pdlKeys.map(key => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return null;
        const entry = JSON.parse(data);
        return { key, timestamp: entry.timestamp || 0 };
      } catch {
        return null;
      }
    }).filter((e): e is { key: string; timestamp: number } => e !== null);

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }

    console.log(`🧹 Cleared ${toRemove} old localStorage entries`);
  } catch (error) {
    console.error('Error clearing old localStorage entries:', error);
  }
}

// Utility: Clear all PDL cache (useful for debugging)
export function clearAllPDLCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    const pdlKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    pdlKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared all PDL cache (${pdlKeys.length} entries)`);
  } catch (error) {
    console.error('Error clearing PDL cache:', error);
  }
}
