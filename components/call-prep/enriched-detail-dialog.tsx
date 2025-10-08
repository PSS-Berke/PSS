'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogPortal,
} from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import { pdlPersonApi, pdlCompanyApi, extractPersonNames, extractCompanyName } from '@/lib/peopledatalab/api';
import type { PDLPersonProfile, PDLCompanyProfile } from '@/lib/peopledatalab/types';
import { lookupPersonCache, savePersonCache, lookupCompanyCache, saveCompanyCache } from '@/lib/peopledatalab/cache';
import { getPersonFromLocalStorage, savePersonToLocalStorage, getCompanyFromLocalStorage, saveCompanyToLocalStorage } from '@/lib/peopledatalab/localStorage-cache';
import { useAuth } from '@/lib/xano/auth-context';

// Position calculator utility - Grid-based layout
interface CardPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  maxWidth: string;
}

// Simple grid-based layout system
function calculateGridPositions(
  moduleCount: number,
  cardSizes: ('small' | 'medium' | 'large')[],
  personIndex: number = 0
): CardPosition[] {
  const positions: CardPosition[] = [];

  // Define a 3-column grid with proper spacing
  // Columns: Left (2%), Center (35%), Right (68%)
  // Rows start at 12% (below title) with 48% spacing between rows
  const columns = [2, 35, 68]; // Left, Center, Right in %
  const rowHeight = 48; // Space between rows in %
  const startTop = 12; // Start below the title

  // Max width for each card size
  const maxWidths = {
    small: '280px',
    medium: '340px',
    large: '440px',
  };

  // Calculate positions in a left-to-right, top-to-bottom grid
  for (let i = 0; i < moduleCount; i++) {
    const size = cardSizes[i] || 'medium';
    const columnIndex = i % 3; // 3 columns per row
    const rowIndex = Math.floor(i / 3); // Which row

    // Offset for multiple people - shift starting position
    const offset = personIndex * moduleCount;
    const adjustedIndex = i + offset;
    const adjustedColumnIndex = adjustedIndex % 3;
    const adjustedRowIndex = Math.floor(adjustedIndex / 3);

    positions.push({
      top: `${startTop + (adjustedRowIndex * rowHeight)}%`,
      left: `${columns[adjustedColumnIndex]}%`,
      maxWidth: maxWidths[size],
    });
  }

  return positions;
}
import { PersonContactModule } from './modules/person-contact-module';
import { PersonCareerModule } from './modules/person-career-module';
import { PersonSkillsModule } from './modules/person-skills-module';
import { CompanyInfoModule } from './modules/company-info-module';
import { CompanyFundingModule } from './modules/company-funding-module';
import { CompanyTechModule } from './modules/company-tech-module';

interface EnrichedDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  icon?: LucideIcon;
  cardKey: string; // 'keyDecisionMakers' or 'companyBackground'
  companyBackgroundContent?: string; // Pass company info for context when enriching people
}

export function EnrichedDetailDialog({
  open,
  onOpenChange,
  title,
  content,
  cardKey,
  icon: Icon,
  companyBackgroundContent,
}: EnrichedDetailDialogProps) {
  const { token, user } = useAuth();
  const [personProfiles, setPersonProfiles] = useState<PDLPersonProfile[]>([]);
  const [companyProfile, setCompanyProfile] = useState<PDLCompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const companyId = user?.company_id || 0;

  const fetchEnrichmentData = useCallback(async () => {
    setIsLoading(true);

    try {
      if (cardKey === 'keyDecisionMakers') {
        // Extract person names from content
        const names = extractPersonNames(content);
        console.log('Extracted person names:', names);

        if (names.length === 0) {
          setIsLoading(false);
          return;
        }

        // Extract company name from company background for context
        const companyName = companyBackgroundContent
          ? extractCompanyName(companyBackgroundContent)
          : null;

        console.log('Company context for person search:', companyName);

        // Fetch data for each person (limit to first 3 to avoid API overuse)
        const personPromises = names.slice(0, 3).map(async (name) => {
          const [firstName, ...lastNameParts] = name.split(' ');
          const lastName = lastNameParts.join(' ');

          try {
            // LAYER 1: Try localStorage first (instant, free)
            const localCached = getPersonFromLocalStorage(firstName, lastName, companyId, companyName ?? undefined);
            if (localCached) {
              return localCached;
            }

            // LAYER 2: Try Xano cache (fast, free)
            const xanoCached = await lookupPersonCache(firstName, lastName, companyName ?? undefined, token ?? undefined);
            if (xanoCached) {
              // Save to localStorage for next time
              savePersonToLocalStorage(firstName, lastName, companyId, xanoCached, companyName ?? undefined);
              return xanoCached;
            }

            // LAYER 3: Call PDL API (slow, costs money)
            const response = await pdlPersonApi.enrichByName({
              first_name: firstName,
              last_name: lastName,
              company: companyName || undefined,
            });

            console.log(`Enrichment response for ${name}:`, {
              status: response.status,
              likelihood: response.likelihood,
              hasData: !!response.data
            });

            if (response.data && response.likelihood >= 6) {
              // Save to BOTH caches
              savePersonToLocalStorage(firstName, lastName, companyId, response.data, companyName ?? undefined);
              await savePersonCache(firstName, lastName, name, response.data, response.likelihood, companyName ?? undefined, token);
              return response.data;
            }
            return null;
          } catch (err: any) {
            console.warn(`Could not find data for ${name}:`, err.message);
            // Return null instead of throwing - some people may not be in database
            return null;
          }
        });

        const results = await Promise.all(personPromises);
        const validProfiles = results.filter((p): p is PDLPersonProfile => p !== null);
        setPersonProfiles(validProfiles);

        if (validProfiles.length < names.length) {
          console.log(`Found ${validProfiles.length} out of ${names.length} people in database`);
        }
      } else if (cardKey === 'companyBackground') {
        // Extract company name from content
        const companyName = extractCompanyName(content);
        console.log('Extracted company name:', companyName);

        if (!companyName) {
          setIsLoading(false);
          return;
        }

        try {
          // LAYER 1: Try localStorage first (instant, free)
          const localCached = getCompanyFromLocalStorage(companyName, companyId);
          if (localCached) {
            setCompanyProfile(localCached);
            return;
          }

          // LAYER 2: Try Xano cache (fast, free)
          const xanoCached = await lookupCompanyCache(companyName, token ?? undefined);
          if (xanoCached) {
            // Save to localStorage for next time
            saveCompanyToLocalStorage(companyName, companyId, xanoCached);
            setCompanyProfile(xanoCached);
            return;
          }

          // LAYER 3: Call PDL API (slow, costs money)
          const response = await pdlCompanyApi.enrichByName(companyName);

          if (response.data && response.likelihood >= 6) {
            // Save to BOTH caches
            saveCompanyToLocalStorage(companyName, companyId, response.data);
            await saveCompanyCache(companyName, response.data, response.likelihood, token ?? undefined);
            setCompanyProfile(response.data);
          }
        } catch (err) {
          console.error('Failed to enrich company:', err);
        }
      }
    } catch (err) {
      console.error('Enrichment error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cardKey, companyBackgroundContent, content, companyId, token]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setPersonProfiles([]);
      setCompanyProfile(null);
      return;
    }

    // Fetch enrichment data when dialog opens
    fetchEnrichmentData();
  }, [open, fetchEnrichmentData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Backdrop - Click to close */}
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        <DialogContent className="max-w-[95vw] max-h-[90vh] h-full w-full flex flex-col rounded-lg bg-transparent border-none shadow-none pointer-events-none">
          {/* Topic Title in Top-Left */}
          <div className="absolute top-4 left-4 pointer-events-auto z-10 inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-md">
            {Icon && <Icon className="h-5 w-5 text-[#C33527]" />}
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>

          {/* Initial Analysis - Below Title */}
          {!isLoading && (
            <div className="absolute top-16 left-4 pointer-events-auto z-10 bg-white rounded-xl shadow-lg p-4 max-w-md">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Initial Analysis</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {content || 'No data available'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
                <div className="w-12 h-12 border-4 border-[#C33527] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Loading enrichment data...</p>
              </div>
            </div>
          )}


          {/* Person Profiles - Floating Modules */}
          {!isLoading && personProfiles.length > 0 && personProfiles.map((person, personIdx) => {
            // Define modules with their sizes
            const modules = [
              { component: <PersonContactModule key="contact" person={person} />, size: 'large' as const },
              { component: <PersonSkillsModule key="skills" person={person} />, size: 'medium' as const },
              { component: <PersonCareerModule key="career" person={person} />, size: 'large' as const },
            ];

            // Calculate grid-based positions
            const cardSizes = modules.map(m => m.size);
            const positions = calculateGridPositions(modules.length, cardSizes, personIdx);

            return (
              <div key={personIdx}>
                {modules.map((module, idx) => (
                  <div
                    key={idx}
                    className="absolute pointer-events-auto"
                    style={{
                      ...positions[idx],
                      animation: `slideInUp 0.5s ease-out ${idx * 100}ms both`,
                    }}
                  >
                    {module.component}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Company Profile - Floating Modules */}
          {!isLoading && companyProfile && (() => {
            const companyModules = [
              { component: <CompanyInfoModule key="info" company={companyProfile} />, size: 'large' as const },
              { component: <CompanyFundingModule key="funding" company={companyProfile} />, size: 'medium' as const },
              { component: <CompanyTechModule key="tech" company={companyProfile} />, size: 'large' as const },
            ];

            const cardSizes = companyModules.map(m => m.size);
            const positions = calculateGridPositions(companyModules.length, cardSizes, 0);

            return (
              <>
                {companyModules.map((module, idx) => (
                  <div
                    key={idx}
                    className="absolute pointer-events-auto"
                    style={{
                      ...positions[idx],
                      animation: `slideInUp 0.5s ease-out ${idx * 100}ms both`,
                    }}
                  >
                    {module.component}
                  </div>
                ))}
              </>
            );
          })()}

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 pointer-events-auto bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
