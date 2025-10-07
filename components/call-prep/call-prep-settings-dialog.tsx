'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw } from 'lucide-react';
import type { CallPrepAnalysis } from '@/lib/xano/call-prep-context';

interface CallPrepSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: CallPrepAnalysis | null;
  onRefresh: (prompt: string) => Promise<void>;
}

export function CallPrepSettingsDialog({
  open,
  onOpenChange,
  analysis,
  onRefresh,
}: CallPrepSettingsDialogProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (analysis) {
      // Try to get the prompt from the analysis or extract from company background
      const initialPrompt = analysis.prompt || getPromptFromAnalysis(analysis);
      setPrompt(initialPrompt);
    }
  }, [analysis]);

  const getPromptFromAnalysis = (analysis: CallPrepAnalysis): string => {
    // Try to extract a meaningful prompt from the company background
    if (analysis.company_background) {
      const firstLine = analysis.company_background.split('\n')[0];
      return firstLine.length > 100 ? firstLine.substring(0, 100) : firstLine;
    }
    return '';
  };

  const handleRefresh = async () => {
    if (!prompt.trim()) return;

    setIsRefreshing(true);
    try {
      await onRefresh(prompt.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to refresh call prep:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!analysis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Call Prep Settings</DialogTitle>
          <DialogDescription>
            Update the company or prompt to regenerate the call prep with fresh insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company or Prompt *</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Subway sandwich chain"
              rows={4}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Clicking &ldquo;Refresh Call Prep&rdquo; will regenerate all sections with updated information based on the company or prompt you specify.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRefreshing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || !prompt.trim()}
            className="flex items-center gap-2 bg-[#C33527] hover:bg-[#DA857C]"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Call Prep
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
