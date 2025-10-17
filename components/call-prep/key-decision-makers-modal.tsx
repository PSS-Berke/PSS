'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, User, Linkedin, Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { KeyDecisionMaker } from '@/lib/xano/call-prep-context';
import type { KeyDecisionMakerWithEnrichment } from '@/lib/utils/call-prep-data';

interface KeyDecisionMakersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionMakers: KeyDecisionMaker[] | KeyDecisionMakerWithEnrichment[];
  companyName: string;
  onEnrich: (person: KeyDecisionMaker) => Promise<{ status: number; data?: any }>;
  isSubmitting: boolean;
}

export function KeyDecisionMakersModal({
  open,
  onOpenChange,
  decisionMakers,
  companyName,
  onEnrich,
  isSubmitting,
}: KeyDecisionMakersModalProps) {
  const [selectedPerson, setSelectedPerson] = useState<
    KeyDecisionMaker | KeyDecisionMakerWithEnrichment | null
  >(null);
  const [enrichmentResult, setEnrichmentResult] = useState<{ status: number; data?: any } | null>(
    null,
  );
  const [bulkEnriching, setBulkEnriching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Helper to check if a person has enrichment data
  const hasEnrichment = (person: KeyDecisionMaker | KeyDecisionMakerWithEnrichment): boolean => {
    return (
      'enrichment' in person && person.enrichment !== undefined && person.enrichment.length > 0
    );
  };

  // Filter out malformed decision makers (must have at least name and title)
  const validDecisionMakers = React.useMemo(() => {
    return decisionMakers.filter(
      (person) =>
        person &&
        typeof person === 'object' &&
        typeof person.name === 'string' &&
        person.name.trim().length > 0 &&
        typeof person.title === 'string',
    );
  }, [decisionMakers]);

  const handlePersonSelect = (person: KeyDecisionMaker | KeyDecisionMakerWithEnrichment) => {
    setSelectedPerson(person);
    setEnrichmentResult(null);

    // Scroll to bottom after a brief delay to ensure content is rendered
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const handleEnrich = async () => {
    if (!selectedPerson) return;

    // Extract base KeyDecisionMaker fields
    const person: KeyDecisionMaker = {
      name: selectedPerson.name,
      title: selectedPerson.title,
      linkedin_url: selectedPerson.linkedin_url || '',
      email: selectedPerson.email,
      kdm_id: selectedPerson.kdm_id,
    };

    const result = await onEnrich(person);
    setEnrichmentResult(result);

    // Scroll to bottom after result is set
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedPerson(null);
    setEnrichmentResult(null);
    setBulkEnriching(false);
    setBulkProgress({ current: 0, total: 0 });
  };

  const handleEnrichAll = async () => {
    const unenrichedPeople = validDecisionMakers.filter((person) => !hasEnrichment(person));

    if (unenrichedPeople.length === 0) {
      return;
    }

    setBulkEnriching(true);
    setBulkProgress({ current: 0, total: unenrichedPeople.length });

    for (let i = 0; i < unenrichedPeople.length; i++) {
      const person = unenrichedPeople[i];
      const basePerson: KeyDecisionMaker = {
        name: person.name,
        title: person.title,
        linkedin_url: person.linkedin_url || '',
        email: person.email,
        kdm_id: person.kdm_id,
      };

      setBulkProgress({ current: i + 1, total: unenrichedPeople.length });
      await onEnrich(basePerson);

      // Small delay between requests to avoid rate limiting
      if (i < unenrichedPeople.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setBulkEnriching(false);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const canSubmit = selectedPerson && !enrichmentResult;
  const unenrichedCount = validDecisionMakers.filter((person) => !hasEnrichment(person)).length;

  const renderEnrichmentResult = () => {
    if (!enrichmentResult) return null;

    if (enrichmentResult.status === 400 || enrichmentResult.status === 404) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-yellow-900">No Additional Data Found</p>
            <p className="text-xs text-yellow-700 mt-1">
              Unable to find enrichment data for this person. They may not be in our database.
            </p>
          </div>
        </div>
      );
    }

    if (enrichmentResult.status === 200 && enrichmentResult.data) {
      const data = enrichmentResult.data;
      const freeData = data.free_data || {};
      const payedData = data.payed_data || {};

      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm text-green-900">Enrichment Complete!</p>
              <p className="text-xs text-green-700 mt-1">
                Successfully retrieved additional data for {selectedPerson?.name}
              </p>
            </div>
          </div>

          {/* Summary of enriched data */}
          <div className="bg-white rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Data Retrieved:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {freeData.location_names && freeData.location_names.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">Location: {freeData.location_names[0]}</span>
                </div>
              )}
              {freeData.job_title && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">Current Role</span>
                </div>
              )}
              {freeData.experience && freeData.experience.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">
                    {freeData.experience.length} work experiences
                  </span>
                </div>
              )}
              {freeData.education && freeData.education.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">
                    {freeData.education.length} education records
                  </span>
                </div>
              )}
              {payedData.work_email && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">Work Email</span>
                </div>
              )}
              {payedData.mobile_phone && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-gray-700">Mobile Phone</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-green-700 mt-3 text-center">
            Close this dialog to see the enriched profile
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enrich Decision Maker Data</DialogTitle>
          <DialogDescription>
            Select a decision maker to enrich with additional information from {companyName}
          </DialogDescription>
        </DialogHeader>

        <div ref={contentRef} className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Decision Makers List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Select a person ({validDecisionMakers.length})
            </Label>
            {validDecisionMakers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No valid decision makers found</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {validDecisionMakers.map((person, index) => {
                  const isEnriched = hasEnrichment(person);
                  return (
                    <button
                      key={index}
                      onClick={() => handlePersonSelect(person)}
                      disabled={isSubmitting}
                      className={`p-4 border rounded-lg text-left transition-all hover:border-primary relative ${
                        selectedPerson === person
                          ? 'border-primary bg-primary/5'
                          : isEnriched
                            ? 'border-green-200 bg-green-50/30'
                            : 'border-gray-200'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isEnriched && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-xs font-medium">Enriched</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <User
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isEnriched ? 'text-green-600' : 'text-muted-foreground'}`}
                        />
                        <div className="flex-1 min-w-0 pr-20">
                          <p className="font-medium text-sm">{person.name}</p>
                          <p className="text-xs text-muted-foreground">{person.title}</p>
                          {person.linkedin_url && (
                            <div className="flex items-center gap-1 mt-1">
                              <Linkedin className="h-3 w-3 text-blue-600" />
                              <p className="text-xs text-blue-600 truncate">
                                {person.linkedin_url}
                              </p>
                            </div>
                          )}
                          {person.email && (
                            <div className="flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3 text-green-600" />
                              <p className="text-xs text-green-600 truncate">{person.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrichment Result */}
          {renderEnrichmentResult()}
        </div>

        <DialogFooter>
          {bulkEnriching ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">
                  Enriching {bulkProgress.current} of {bulkProgress.total}...
                </span>
                <span className="text-sm font-medium text-[#C33527]">
                  {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#C33527] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || bulkEnriching}
              >
                {enrichmentResult ? 'Close' : 'Skip'}
              </Button>
              {!enrichmentResult && unenrichedCount > 1 && (
                <Button
                  variant="outline"
                  onClick={handleEnrichAll}
                  disabled={isSubmitting || bulkEnriching}
                  className="border-[#C33527] text-[#C33527] hover:bg-[#C33527] hover:text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enrich All ({unenrichedCount})
                </Button>
              )}
              {!enrichmentResult && (
                <Button
                  onClick={handleEnrich}
                  disabled={!canSubmit || isSubmitting || bulkEnriching}
                  className="bg-[#C33527] hover:bg-[#DA857C]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enriching...
                    </>
                  ) : selectedPerson ? (
                    `Enrich ${selectedPerson.name}`
                  ) : (
                    'Select a person'
                  )}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
