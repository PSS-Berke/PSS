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
  const { state, generateCallPrep, loadLatestAnalysis } = useCallPrep();

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

  const handleGenerateSubmit = async (prompt: string) => {
    await generateCallPrep(prompt);
    setPromptDialogOpen(false);
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
      <Card className={`w-full ${className} relative`}>
        {/* Expand Button - Positioned in top-right corner */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-[32px] right-[12px] z-10 px-[17px] py-3"
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between pr-28">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C33527]/10 rounded-lg">
                <Building2 className="h-5 w-5 text-[#C33527]" />
              </div>
              <div>
                <CardTitle className="text-lg">Call Prep Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered company analysis for sales calls
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center gap-1.5 px-1">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-0">
            <div className="flex h-[600px]">
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
        onSubmit={handleGenerateSubmit}
        isSubmitting={state.isSubmitting}
      />
    </>
  );
}
