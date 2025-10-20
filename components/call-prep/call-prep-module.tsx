'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, ChevronUp, FileCheck, Plus, Settings, Users } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { CallPrepContent } from './call-prep-content';
import { CallPrepPromptDialog } from './call-prep-prompt-dialog';
import { CallPrepSidebar } from './call-prep-sidebar';
import { CallPrepSettingsDialog } from './call-prep-settings-dialog';
import { KeyDecisionMakersModal } from './key-decision-makers-modal';

interface CallPrepModuleProps {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function CallPrepModule({ className, onExpandedChange }: CallPrepModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false);
  const { state, loadLatestAnalysis, generateCallPrep, enrichPersonData } = useCallPrep();
  const hasLoadedRef = React.useRef(false);

  // Load data when module is expanded
  useEffect(() => {
    if (isExpanded && !hasLoadedRef.current && !state.latestAnalysis && !state.isLoading) {
      console.log('CallPrep Module: Expanded, loading latest analysis');
      hasLoadedRef.current = true;
      loadLatestAnalysis();
    }
  }, [isExpanded, state.latestAnalysis, state.isLoading, loadLatestAnalysis]);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.isSubmitting) {
      return (
        <Badge variant="default" className="animate-pulse">
          Generating...
        </Badge>
      );
    }
    if (state.currentAnalysis) {
      return <Badge variant="default">Active Card</Badge>;
    }
    if (state.latestAnalysis) {
      return <Badge variant="outline">Ready</Badge>;
    }
    return <Badge variant="outline">Ready</Badge>;
  };

  return (
    <>
      <Card className={`w-full ${className}`}>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-3 p-4 md:p-6"
          onClick={toggleExpanded}
        >
          {/* Left Section: Icon + Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-[#C33527]/10 rounded-lg flex-shrink-0">
              <Building2 className="h-5 w-5 text-[#C33527]" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg truncate">Call Prep Assistant</CardTitle>
              <p className="text-sm text-muted-foreground hidden md:block">
                AI-powered company analysis for sales calls
              </p>
            </div>
          </div>

          {/* Right Section: Badges + Expand Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status info - compact on mobile, full on desktop */}
            <div className="flex items-center gap-1.5 md:gap-2 md:pr-6">
              {/* FileCheck icon - hidden on mobile to save space */}
              <div className="hidden md:flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              {getStatusBadge()}
            </div>

            {/* Expand button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-9 w-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-0 relative">
            {/* Generation Loading Overlay */}
            {state.isSubmitting && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-8 border-[#C33527]/20 border-t-[#C33527] rounded-full animate-spin mx-auto"></div>
                    <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-[#C33527]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Generating Call Prep...</h3>
                    <p className="text-sm text-gray-600 max-w-md">
                      Analyzing company information, key decision makers, and preparing strategic
                      insights
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-[#C33527] rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-[#C33527] rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#C33527] rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Layout: Stack vertically */}
            <div className="flex flex-col md:hidden h-[500px]">
              {/* Call Prep History (Top Horizontal Scroll) */}
              <CallPrepSidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Title and Action Buttons */}
                <div className="flex flex-col gap-3 p-4 pb-3 border-b">
                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800 truncate flex-1">
                      {state.latestAnalysis?.prompt || 'Call Preparation'}
                    </h1>
                    <span className="rounded-full bg-[#C33527] px-2 py-0.5 text-xs font-semibold text-white flex-shrink-0">
                      Ready
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSettingsDialogOpen(true)}
                      className="h-8 w-8 flex-shrink-0"
                      aria-label="Call prep settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    {state.latestAnalysis?.keyDecisionMakersWithEnrichment &&
                     state.latestAnalysis.keyDecisionMakersWithEnrichment.length > 0 && (
                      <Button
                        onClick={() => setEnrichmentDialogOpen(true)}
                        variant="outline"
                        disabled={state.isSubmitting}
                        size="sm"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Enrich People
                      </Button>
                    )}
                    <Button
                      onClick={() => setPromptDialogOpen(true)}
                      className="bg-[#C33527] hover:bg-[#DA857C]"
                      disabled={state.isSubmitting}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <CallPrepContent />
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex h-[600px]">
              {/* Sidebar */}
              <CallPrepSidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Title and Action Buttons */}
                <div className="flex items-center justify-between gap-4 p-6 pb-4 border-b">
                  {/* Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 truncate">
                      {state.latestAnalysis?.prompt || 'Call Preparation'}
                    </h1>
                    <span className="rounded-full bg-[#C33527] px-3 py-1 text-sm font-semibold text-white flex-shrink-0">
                      Ready
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSettingsDialogOpen(true)}
                      className="h-9 w-9"
                      aria-label="Call prep settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    {state.latestAnalysis?.keyDecisionMakersWithEnrichment &&
                     state.latestAnalysis.keyDecisionMakersWithEnrichment.length > 0 && (
                      <Button
                        onClick={() => setEnrichmentDialogOpen(true)}
                        variant="outline"
                        disabled={state.isSubmitting}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Enrich People
                      </Button>
                    )}
                    <Button
                      onClick={() => setPromptDialogOpen(true)}
                      className="bg-[#C33527] hover:bg-[#DA857C]"
                      disabled={state.isSubmitting}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Call Prep
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <CallPrepContent />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <CallPrepPromptDialog
        open={promptDialogOpen}
        onOpenChange={setPromptDialogOpen}
        isSubmitting={state.isSubmitting}
      />

      {state.latestAnalysis?.keyDecisionMakersWithEnrichment &&
       state.latestAnalysis.keyDecisionMakersWithEnrichment.length > 0 && (
        <KeyDecisionMakersModal
          open={enrichmentDialogOpen}
          onOpenChange={setEnrichmentDialogOpen}
          decisionMakers={state.latestAnalysis.keyDecisionMakersWithEnrichment}
          companyName={state.latestAnalysis.prompt || ''}
          onEnrich={async (person) => {
            return await enrichPersonData(person, state.latestAnalysis!.prompt || '');
          }}
          isSubmitting={state.isSubmitting}
        />
      )}

      {state.latestAnalysis && (
        <CallPrepSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          analysis={state.latestAnalysis}
          onRefresh={async (prompt: string) => {
            await generateCallPrep(prompt);
          }}
        />
      )}
    </>
  );
}
