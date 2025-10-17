'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LucideIcon, UserPlus, Sparkles } from 'lucide-react';
import {
  pdlPersonApi,
  pdlCompanyApi,
  extractPersonNames,
  extractCompanyName,
} from '@/lib/peopledatalab/api';
import type { PDLPersonProfile, PDLCompanyProfile } from '@/lib/peopledatalab/types';
import {
  lookupPersonCache,
  savePersonCache,
  lookupCompanyCache,
  saveCompanyCache,
} from '@/lib/peopledatalab/cache';
import {
  getPersonFromLocalStorage,
  savePersonToLocalStorage,
  getCompanyFromLocalStorage,
  saveCompanyToLocalStorage,
} from '@/lib/peopledatalab/localStorage-cache';
import { useAuth } from '@/lib/xano/auth-context';
import { useCallPrep, type KeyDecisionMaker } from '@/lib/xano/call-prep-context';
import { KeyDecisionMakersModal } from './key-decision-makers-modal';
import type { KeyDecisionMakerWithEnrichment } from '@/lib/utils/call-prep-data';

// Position calculator utility - Grid-based layout
interface CardPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  maxWidth: string;
}

// Compact pixel-based layout system for Deep Dive view
function calculateGridPositions(
  moduleCount: number,
  cardSizes: ('small' | 'medium' | 'large')[],
  personIndex: number = 0,
): CardPosition[] {
  const positions: CardPosition[] = [];

  // Pixel-based spacing for tight, grouped layout
  const gap = 8; // Reduced horizontal gap between cards (tighter layout)
  const verticalGap = 16; // Minimal vertical gap between person rows
  const startLeft = 16; // Align with title card (left-4 = 16px)
  const startTop = 16; // Start 16px below the container top
  const estimatedCardHeight = 520; // Reduced buffer - just enough to accommodate Career cards (~500px)

  // Card widths in pixels
  const cardWidths = {
    small: 280,
    medium: 340,
    large: 440,
  };

  // Calculate horizontal positions for a 3-card row (Contact, Skills, Career)
  // Card positions are cumulative: start + width + gap + width + gap...
  let cumulativeLeft = startLeft;
  const horizontalPositions: number[] = [];

  for (let i = 0; i < Math.min(moduleCount, 3); i++) {
    horizontalPositions.push(cumulativeLeft);
    const cardWidth = cardWidths[cardSizes[i]] || cardWidths.medium;
    cumulativeLeft += cardWidth + gap;
  }

  // Calculate positions for each card
  for (let i = 0; i < moduleCount; i++) {
    const size = cardSizes[i] || 'medium';
    const columnIndex = i % 3; // 3 cards per person (row)

    // Vertical position: each person's row is separated by estimated card height + vertical gap
    const verticalOffset = personIndex * (estimatedCardHeight + verticalGap);

    positions.push({
      top: `${startTop + verticalOffset}px`,
      left: `${horizontalPositions[columnIndex]}px`,
      maxWidth: `${cardWidths[size]}px`,
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
import { KeyDecisionMakerCard } from './key-decision-maker-card';

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
  const { state, enrichPersonData } = useCallPrep();
  const [personProfiles, setPersonProfiles] = useState<PDLPersonProfile[]>([]);
  const [companyProfile, setCompanyProfile] = useState<PDLCompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrichedOnly, setShowEnrichedOnly] = useState(false);
  const [enrichingId, setEnrichingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'deepdive'>('grid');

  const companyId = user?.company_id || 0;
  const analysis = state.latestAnalysis;

  // Extract decision makers from content for the modal
  const decisionMakers: KeyDecisionMaker[] = React.useMemo(() => {
    if (cardKey !== 'keyDecisionMakers') return [];

    // Use the enriched data if available
    if (analysis?.keyDecisionMakersWithEnrichment) {
      return analysis.keyDecisionMakersWithEnrichment.map((kdm) => ({
        name: kdm.name,
        title: kdm.title,
        linkedin_url: kdm.linkedin_url || '',
        email: kdm.email || '',
        kdm_id: kdm.kdm_id,
      }));
    }

    // Fallback: try to parse from JSON string
    if (analysis?.key_decision_makers_contact) {
      try {
        const parsed = JSON.parse(analysis.key_decision_makers_contact);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse key_decision_makers_contact:', e);
      }
    }

    // Final fallback: parse from text content
    const names = extractPersonNames(content);
    return names.map((name) => ({
      name,
      title: '',
      linkedin_url: '',
      email: '',
    }));
  }, [cardKey, content, analysis]);

  const handleEnrichPerson = async (person: KeyDecisionMaker) => {
    if (!analysis) return { status: 400 };

    const companyName = companyBackgroundContent
      ? extractCompanyName(companyBackgroundContent) || ''
      : '';

    return await enrichPersonData(person, companyName);
  };

  const handleInlineEnrich = async (person: KeyDecisionMakerWithEnrichment) => {
    const basePerson: KeyDecisionMaker = {
      name: person.name,
      title: person.title,
      linkedin_url: person.linkedin_url || '',
      email: person.email || '',
      kdm_id: person.kdm_id,
    };
    setEnrichingId(person.kdm_id ?? null);
    await handleEnrichPerson(basePerson);
    setEnrichingId(null);
  };

  // Filter decision makers based on search and enrichment status
  const filteredDecisionMakers = React.useMemo(() => {
    if (!analysis?.keyDecisionMakersWithEnrichment) return [];

    let filtered = analysis.keyDecisionMakersWithEnrichment;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (kdm) =>
          kdm.name.toLowerCase().includes(query) ||
          kdm.title.toLowerCase().includes(query) ||
          kdm.email?.toLowerCase().includes(query),
      );
    }

    // Filter by enrichment status
    if (showEnrichedOnly) {
      filtered = filtered.filter((kdm) => kdm.enrichment && kdm.enrichment.length > 0);
    }

    return filtered;
  }, [analysis?.keyDecisionMakersWithEnrichment, searchQuery, showEnrichedOnly]);

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
            const localCached = getPersonFromLocalStorage(
              firstName,
              lastName,
              companyId,
              companyName ?? undefined,
            );
            if (localCached) {
              return localCached;
            }

            // LAYER 2: Try Xano cache (fast, free)
            const xanoCached = await lookupPersonCache(
              firstName,
              lastName,
              companyName ?? undefined,
              token ?? undefined,
            );
            if (xanoCached) {
              // Save to localStorage for next time
              savePersonToLocalStorage(
                firstName,
                lastName,
                companyId,
                xanoCached,
                companyName ?? undefined,
              );
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
              hasData: !!response.data,
            });

            if (response.data && response.likelihood >= 6) {
              // Save to BOTH caches
              savePersonToLocalStorage(
                firstName,
                lastName,
                companyId,
                response.data,
                companyName ?? undefined,
              );
              await savePersonCache(
                firstName,
                lastName,
                name,
                response.data,
                response.likelihood,
                companyName ?? undefined,
                token ?? undefined,
              );
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
            await saveCompanyCache(
              companyName,
              response.data,
              response.likelihood,
              token ?? undefined,
            );
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
          {/* Topic Title and Tabs in Top-Left */}
          <div className="absolute top-4 left-4 pointer-events-auto z-10 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
              {Icon && <Icon className="h-5 w-5 text-[#C33527]" />}
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>

            {/* Tab Navigation - Only show for Key Decision Makers */}
            {cardKey === 'keyDecisionMakers' && (
              <div className="flex gap-1 p-1">
                <button
                  onClick={() => setActiveTab('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'grid'
                      ? 'bg-[#C33527] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setActiveTab('deepdive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'deepdive'
                      ? 'bg-[#C33527] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Deep Dive
                </button>
              </div>
            )}
          </div>

          {/* Initial Analysis - Below Title */}
          {!isLoading && cardKey !== 'keyDecisionMakers' && (
            <div className="absolute top-16 left-4 pointer-events-auto z-10 bg-white rounded-xl shadow-lg p-4 max-w-md">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Initial Analysis</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {content || 'No data available'}
              </p>
            </div>
          )}

          {/* Grid View Tab - Key Decision Makers with Enrichment */}
          {!isLoading &&
            cardKey === 'keyDecisionMakers' &&
            activeTab === 'grid' &&
            analysis?.keyDecisionMakersWithEnrichment && (
              <div className="absolute top-32 left-4 right-4 pointer-events-auto z-10 max-h-[calc(90vh-160px)] overflow-y-auto pt-4 pb-4">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 sticky top-0 z-20">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by name, title, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C33527] focus:border-transparent"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant={showEnrichedOnly ? 'default' : 'outline'}
                      onClick={() => setShowEnrichedOnly(!showEnrichedOnly)}
                      className={showEnrichedOnly ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {showEnrichedOnly ? 'Showing Enriched' : 'Show Enriched Only'}
                    </Button>
                    <div className="text-sm text-gray-600">
                      {filteredDecisionMakers.length} of{' '}
                      {analysis.keyDecisionMakersWithEnrichment.length} people
                    </div>
                  </div>
                </div>

                {/* Unified Grid of Decision Makers */}
                {filteredDecisionMakers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDecisionMakers.map((kdm, idx) => (
                      <KeyDecisionMakerCard
                        key={idx}
                        decisionMaker={kdm}
                        onEnrich={() => handleInlineEnrich(kdm)}
                        isEnriching={enrichingId === kdm.kdm_id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600">No decision makers found matching your filters.</p>
                  </div>
                )}
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

          {/* Deep Dive Tab - Empty State */}
          {!isLoading &&
            cardKey === 'keyDecisionMakers' &&
            activeTab === 'deepdive' &&
            personProfiles.length === 0 && (
              <div className="absolute top-32 left-4 right-4 pointer-events-auto z-10">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto">
                  <p className="text-gray-700 font-medium mb-2">Deep Dive View</p>
                  <p className="text-sm text-gray-600">
                    Detailed profile cards will appear here when additional enrichment data is
                    available from People Data Labs.
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    This data is loaded separately and may take a moment to appear.
                  </p>
                </div>
              </div>
            )}

          {/* Deep Dive Tab - Person Profiles - Floating Modules */}
          {!isLoading &&
            cardKey === 'keyDecisionMakers' &&
            activeTab === 'deepdive' &&
            personProfiles.length > 0 && (
              <div className="absolute top-32 left-4 right-4 pointer-events-auto z-10 max-h-[calc(90vh-160px)] overflow-y-auto pt-4 pb-4">
                <div
                  className="relative"
                  style={{ minHeight: `${personProfiles.length * 536 + 32}px` }}
                >
                  {personProfiles.map((person, personIdx) => {
                    // Define modules with their sizes
                    const modules = [
                      {
                        component: <PersonContactModule key="contact" person={person} />,
                        size: 'large' as const,
                      },
                      {
                        component: <PersonSkillsModule key="skills" person={person} />,
                        size: 'medium' as const,
                      },
                      {
                        component: <PersonCareerModule key="career" person={person} />,
                        size: 'large' as const,
                      },
                    ];

                    // Calculate compact pixel-based positions
                    const cardSizes = modules.map((m) => m.size);
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
                </div>
              </div>
            )}

          {/* Company Profile - Floating Modules (always show for company background) */}
          {!isLoading && cardKey === 'companyBackground' && companyProfile && (
            <div className="absolute top-32 left-4 right-4 pointer-events-auto z-10 max-h-[calc(90vh-160px)] overflow-y-auto pt-4 pb-4">
              <div className="relative" style={{ minHeight: '448px' }}>
                {(() => {
                  const companyModules = [
                    {
                      component: <CompanyInfoModule key="info" company={companyProfile} />,
                      size: 'large' as const,
                    },
                    {
                      component: <CompanyFundingModule key="funding" company={companyProfile} />,
                      size: 'medium' as const,
                    },
                    {
                      component: <CompanyTechModule key="tech" company={companyProfile} />,
                      size: 'large' as const,
                    },
                  ];

                  const cardSizes = companyModules.map((m) => m.size);
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
              </div>
            </div>
          )}

          {/* Enrich People button - Only show for Grid View tab */}
          {cardKey === 'keyDecisionMakers' && activeTab === 'grid' && decisionMakers.length > 0 && (
            <Button
              onClick={() => setEnrichModalOpen(true)}
              className="absolute top-4 right-16 pointer-events-auto bg-[#C33527] hover:bg-[#DA857C] text-white shadow-lg transition-all hover:scale-105 z-50"
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Enrich People
            </Button>
          )}

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 pointer-events-auto bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </DialogContent>
      </DialogPortal>

      {/* Key Decision Makers Enrichment Modal */}
      {cardKey === 'keyDecisionMakers' && (
        <KeyDecisionMakersModal
          open={enrichModalOpen}
          onOpenChange={setEnrichModalOpen}
          decisionMakers={decisionMakers}
          companyName={
            companyBackgroundContent
              ? extractCompanyName(companyBackgroundContent) || 'the company'
              : 'the company'
          }
          onEnrich={handleEnrichPerson}
          isSubmitting={state.isSubmitting}
        />
      )}
    </Dialog>
  );
}
