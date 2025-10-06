'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, ChevronUp, Loader2, FileCheck } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { CallPrepSubmissionForm } from './call-prep-submission-form';
import { CallPrepContent } from './call-prep-content';

interface CallPrepModuleProps {
  className?: string;
}

export function CallPrepModule({ className }: CallPrepModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state, loadLatestAnalysis } = useCallPrep();

  useEffect(() => {
    // Auto-load on mount
    loadLatestAnalysis();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLatestAnalysis, 30000);
    return () => clearInterval(interval);
  }, [loadLatestAnalysis]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading
        </Badge>
      );
    }
    if (state.latestAnalysis) {
      return <Badge variant="outline">Analysis Ready</Badge>;
    }
    return <Badge variant="secondary">No Analysis</Badge>;
  };

  return (
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
        <CardContent className="space-y-6">
          <CallPrepSubmissionForm />
          <CallPrepContent />
        </CardContent>
      )}
    </Card>
  );
}
