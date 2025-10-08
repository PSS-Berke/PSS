'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import { pdlPersonApi, pdlCompanyApi, extractPersonNames, extractCompanyName } from '@/lib/peopledatalab/api';
import type { PDLPersonProfile, PDLCompanyProfile } from '@/lib/peopledatalab/types';
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
}

export function EnrichedDetailDialog({
  open,
  onOpenChange,
  title,
  content,
  icon: Icon,
  cardKey,
}: EnrichedDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [personProfiles, setPersonProfiles] = useState<PDLPersonProfile[]>([]);
  const [companyProfile, setCompanyProfile] = useState<PDLCompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setPersonProfiles([]);
      setCompanyProfile(null);
      setError(null);
      return;
    }

    // Fetch enrichment data when dialog opens
    fetchEnrichmentData();
  }, [open, content, cardKey]);

  const fetchEnrichmentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (cardKey === 'keyDecisionMakers') {
        // Extract person names from content
        const names = extractPersonNames(content);
        console.log('Extracted person names:', names);

        if (names.length === 0) {
          setError('No decision maker names found in the content');
          setIsLoading(false);
          return;
        }

        // Fetch data for each person (limit to first 3 to avoid API overuse)
        const personPromises = names.slice(0, 3).map(async (name) => {
          const [firstName, ...lastNameParts] = name.split(' ');
          const lastName = lastNameParts.join(' ');

          try {
            const response = await pdlPersonApi.enrichByName({
              first_name: firstName,
              last_name: lastName,
            });

            if (response.data && response.likelihood >= 6) {
              return response.data;
            }
            return null;
          } catch (err) {
            console.error(`Failed to enrich person: ${name}`, err);
            return null;
          }
        });

        const results = await Promise.all(personPromises);
        const validProfiles = results.filter((p): p is PDLPersonProfile => p !== null);
        setPersonProfiles(validProfiles);

        if (validProfiles.length === 0) {
          setError('Could not find enrichment data for the decision makers');
        }
      } else if (cardKey === 'companyBackground') {
        // Extract company name from content
        const companyName = extractCompanyName(content);
        console.log('Extracted company name:', companyName);

        if (!companyName) {
          setError('Could not identify company name in the content');
          setIsLoading(false);
          return;
        }

        try {
          const response = await pdlCompanyApi.enrichByName(companyName);

          if (response.data && response.likelihood >= 6) {
            setCompanyProfile(response.data);
          } else {
            setError('Could not find enrichment data for the company');
          }
        } catch (err) {
          console.error('Failed to enrich company:', err);
          setError('Failed to fetch company enrichment data');
        }
      }
    } catch (err) {
      console.error('Enrichment error:', err);
      setError('An error occurred while fetching enrichment data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-[#C33527]" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Original Content */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Original Analysis</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {content || 'No data available'}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#C33527] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Enriching with People Data Labs...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          {/* Person Profiles - Collage Layout */}
          {!isLoading && personProfiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Enriched Decision Maker Data
              </h3>
              <div className="space-y-6">
                {personProfiles.map((person, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-md font-semibold text-[#C33527] border-b border-gray-200 pb-2">
                      {person.full_name}
                    </h4>
                    {/* Masonry-style collage layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                      {/* Contact module - larger */}
                      <div className="md:col-span-1 lg:col-span-2">
                        <PersonContactModule person={person} />
                      </div>

                      {/* Skills module */}
                      <div className="md:col-span-1">
                        <PersonSkillsModule person={person} />
                      </div>

                      {/* Career module - full width */}
                      <div className="md:col-span-2 lg:col-span-3">
                        <PersonCareerModule person={person} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Profile - Collage Layout */}
          {!isLoading && companyProfile && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Enriched Company Data
              </h3>
              {/* Masonry-style collage layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
                {/* Company info - larger, spans 2 columns */}
                <div className="md:col-span-2">
                  <CompanyInfoModule company={companyProfile} />
                </div>

                {/* Funding module */}
                <div className="md:col-span-1">
                  <CompanyFundingModule company={companyProfile} />
                </div>

                {/* Tech module - full width */}
                <div className="md:col-span-2 lg:col-span-3">
                  <CompanyTechModule company={companyProfile} />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
