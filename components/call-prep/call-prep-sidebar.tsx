'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import {
  Plus,
  Building2,
  Loader2,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import type { CallPrepAnalysis } from '@/lib/xano/call-prep-context';

interface CallPrepSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function CallPrepSidebar({
  className,
  isCollapsed: propIsCollapsed,
  onCollapseChange,
}: CallPrepSidebarProps) {
  const {
    state,
    loadAllAnalyses,
    selectAnalysis,
    deleteAnalysis,
  } = useCallPrep();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isAnalysesExpanded, setIsAnalysesExpanded] = useState(true);
  const [menuOpenForAnalysis, setMenuOpenForAnalysis] = useState<number | null>(null);
  const [analysisPendingDeletion, setAnalysisPendingDeletion] = useState<CallPrepAnalysis | null>(null);
  const [isDeletingAnalysis, setIsDeletingAnalysis] = useState(false);

  // Determine if component is controlled by parent via prop
  const isControlled = typeof propIsCollapsed !== 'undefined';
  const isCollapsed = isControlled ? (propIsCollapsed as boolean) : internalCollapsed;

  const setCollapsed = (value: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(value);
    }
    try {
      if (typeof onCollapseChange === 'function') onCollapseChange(value);
    } catch (err) {
      // ignore
    }
  };

  // Load all analyses on mount
  useEffect(() => {
    if (!isCollapsed) {
      loadAllAnalyses();
    }
  }, [isCollapsed, loadAllAnalyses]);

  const handleAnalysisClick = (id: number) => {
    if (state.currentAnalysis?.id === id) return;
    selectAnalysis(id);
  };

  const handleMenuToggle = (analysisId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForAnalysis((prev) => (prev === analysisId ? null : analysisId));
  };

  const handleDeleteOption = (analysis: CallPrepAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForAnalysis(null);
    setAnalysisPendingDeletion(analysis);
  };

  const closeDeleteDialog = () => {
    if (!isDeletingAnalysis) {
      setAnalysisPendingDeletion(null);
    }
  };

  const handleConfirmDeleteAnalysis = async () => {
    if (!analysisPendingDeletion) return;

    try {
      setIsDeletingAnalysis(true);
      await deleteAnalysis(analysisPendingDeletion.id);
      setAnalysisPendingDeletion(null);
    } catch (error) {
      console.error('Failed to delete analysis', error);
    } finally {
      setIsDeletingAnalysis(false);
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnalysisTitle = (analysis: CallPrepAnalysis) => {
    // Try to extract company name from prompt or company_background
    if (analysis.prompt) {
      return analysis.prompt.length > 30
        ? analysis.prompt.substring(0, 30) + '...'
        : analysis.prompt;
    }
    if (analysis.company_background) {
      const firstLine = analysis.company_background.split('\n')[0];
      return firstLine.length > 30
        ? firstLine.substring(0, 30) + '...'
        : firstLine;
    }
    return `Analysis #${analysis.id}`;
  };

  return (
    <div
      className={`${isCollapsed ? 'w-14' : 'w-80'} border-r bg-muted/30 flex flex-col h-full transition-all duration-300 ${className ?? ''}`}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4">
          <Button
            onClick={() => setCollapsed(false)}
            size="sm"
            className="bg-black hover:bg-black/80 text-white h-10 w-10 p-0"
            aria-label="Open call prep sidebar"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Call Prep History</h3>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Collapse call prep sidebar"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {state.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading analyses...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analyses List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
          {!state.allAnalyses.length && !state.isLoading ? (
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No call prep yet</p>
              <p className="text-xs">Generate your first call prep to get started</p>
            </div>
          ) : (
            state.allAnalyses.length > 0 && (
              <div className="space-y-3">
                <div
                  className="font-semibold text-sm text-foreground border-b pb-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors flex items-center justify-between"
                  onClick={() => setIsAnalysesExpanded(!isAnalysesExpanded)}
                >
                  <div className="flex items-center gap-1">
                    {isAnalysesExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h3>All Analyses</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({state.allAnalyses.length})
                  </span>
                </div>
                {isAnalysesExpanded && (
                  <div className="space-y-1">
                    {state.allAnalyses.map((analysis) => (
                      <Card
                        key={analysis.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                          state.currentAnalysis?.id === analysis.id
                            ? 'bg-accent border-primary'
                            : ''
                        }`}
                        onClick={() => handleAnalysisClick(analysis.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {getAnalysisTitle(analysis)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(analysis.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {state.currentAnalysis?.id === analysis.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleMenuToggle(analysis.id, e)}
                                aria-label="Open analysis actions"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                              {menuOpenForAnalysis === analysis.id && (
                                <div className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background shadow-md">
                                  <button
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleDeleteOption(analysis, e)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {!isCollapsed && (
        <Dialog
          open={!!analysisPendingDeletion}
          onOpenChange={(open) => {
            if (!open) {
              closeDeleteDialog();
            }
          }}
        >
          <DialogContent className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-background px-6 py-5">
            <DialogHeader className="space-y-2">
              <DialogTitle>Delete call prep?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The call prep analysis will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this call prep? All analysis data will be lost.
            </p>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={isDeletingAnalysis}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDeleteAnalysis}
                disabled={isDeletingAnalysis}
              >
                {isDeletingAnalysis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
