'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Copy, Loader2, RefreshCw } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';

export function CallPrepContent() {
  const [copySuccess, setCopySuccess] = useState(false);
  const { state, loadLatestAnalysis } = useCallPrep();

  const handleCopyAnalysis = async () => {
    if (state.latestAnalysis?.analysis) {
      try {
        await navigator.clipboard.writeText(state.latestAnalysis.analysis);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-background/80 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Latest Analysis</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadLatestAnalysis()}
          disabled={state.isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {state.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : state.isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#C33527]" />
          <p className="text-sm text-muted-foreground">Loading latest results...</p>
        </div>
      ) : state.latestAnalysis ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {state.latestAnalysis.analysis}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAnalysis}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copySuccess ? 'Copied!' : 'Copy Analysis'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No analysis available yet. Submit a company lookup above.
          </p>
        </div>
      )}
    </div>
  );
}
