'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, ChevronUp, FileCheck, Plus } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { CallPrepContent } from './call-prep-content';
import { CallPrepPromptDialog } from './call-prep-prompt-dialog';
import { CallPrepSidebar } from './call-prep-sidebar';

interface CallPrepModuleProps {
  className?: string;
}

export function CallPrepModule({ className }: CallPrepModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const { state, loadLatestAnalysis } = useCallPrep();

  // Load data when module is expanded
  useEffect(() => {
    if (isExpanded && !state.latestAnalysis && !state.isLoading) {
      console.log('CallPrep Module: Expanded, loading latest analysis');
      loadLatestAnalysis();
    }
  }, [isExpanded, state.latestAnalysis, state.isLoading, loadLatestAnalysis]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.isSubmitting) {
      return <Badge variant="default">Generating...</Badge>;
    }
    if (state.latestAnalysis) {
      return <Badge variant="default">Analysis Ready</Badge>;
    }
    return <Badge variant="secondary">No Analysis</Badge>;
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

          {/* Right Section: Badges (hidden on mobile) + Expand Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status info - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5">
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
          <CardContent className="p-0">
            {/* Mobile Layout: Stack vertically */}
            <div className="flex flex-col md:hidden h-[500px]">
              {/* Call Prep History (Top Horizontal Scroll) */}
              <CallPrepSidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Generate Button */}
                <div className="flex justify-end p-4 pb-3 border-b">
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
                {/* Generate Button */}
                <div className="flex justify-end p-6 pb-4 border-b">
                  <Button
                    onClick={() => setPromptDialogOpen(true)}
                    className="bg-[#C33527] hover:bg-[#DA857C]"
                    disabled={state.isSubmitting}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Call Prep
                  </Button>
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
    </>
  );
}
