'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
  Building2,
  Loader2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
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

  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const [menuOpenForAnalysis, setMenuOpenForAnalysis] = useState<number | null>(null);
  const [analysisPendingDeletion, setAnalysisPendingDeletion] = useState<CallPrepAnalysis | null>(null);
  const [isDeletingAnalysis, setIsDeletingAnalysis] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Load all analyses on mount - only once across all sidebar instances
  useEffect(() => {
    if (!hasLoadedRef.current && !state.isLoading && state.allAnalyses.length === 0) {
      hasLoadedRef.current = true;
      loadAllAnalyses();
    }
  }, [loadAllAnalyses, state.isLoading, state.allAnalyses.length]);

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

  // Handle mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'md:w-14 h-14 md:h-full' : 'md:w-80 h-auto md:h-full'
      } md:border-r border-b md:border-b-0 bg-muted/30 flex flex-col w-full transition-all duration-300 ${className ?? ''}`}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4 h-14 md:h-auto">
          <Button
            onClick={() => setCollapsed(false)}
            size="sm"
            className="bg-black hover:bg-black/80 text-white h-10 px-4 md:w-10 md:p-0"
            aria-label="Open call prep history"
          >
            <ChevronDown className="h-4 w-4 mr-2 md:hidden" />
            <MoreHorizontal className="h-4 w-4 hidden md:block" />
            <span className="md:hidden">Call Prep History</span>
          </Button>
        </div>
      )}

      {/* Expanded Header & Content */}
      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Call Prep History ({state.allAnalyses.length})
                </h3>
                {state.isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden md:inline">Loading...</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Collapse call prep history"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile: Horizontal Scrollable Analyses */}
          <div className="relative md:hidden">
            {!state.allAnalyses.length && !state.isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No call prep yet</p>
                <p className="text-xs">Generate your first call prep to get started</p>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {state.allAnalyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className={`p-4 cursor-pointer transition-all hover:bg-accent flex-shrink-0 w-64 ${
                      state.currentAnalysis?.id === analysis.id
                        ? 'bg-accent border-primary ring-2 ring-primary/20'
                        : ''
                    }`}
                    onClick={() => handleAnalysisClick(analysis.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium line-clamp-2">
                              {getAnalysisTitle(analysis)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(analysis.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
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
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: Vertical List */}
          <div className="hidden md:flex flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
            {!state.allAnalyses.length && !state.isLoading ? (
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No call prep yet</p>
                <p className="text-xs">Generate your first call prep to get started</p>
              </div>
            ) : (
              state.allAnalyses.length > 0 && (
                <div className="space-y-1 w-full">
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
              )
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
