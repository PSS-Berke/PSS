'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Target,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { cn } from '@/lib/utils';
import type { BattleCardListItem } from '@/lib/xano/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface BattleCardSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function BattleCardSidebar({
  className,
  isCollapsed,
  onCollapseChange,
}: BattleCardSidebarProps) {
  const { state, generateBattleCard, deleteBattleCard, loadBattleCardDetail } = useBattleCard();
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [menuOpenForCard, setMenuOpenForCard] = useState<number | null>(null);
  const [battleCardPendingDeletion, setBattleCardPendingDeletion] =
    useState<BattleCardListItem | null>(null);
  const [isDeletingBattleCard, setIsDeletingBattleCard] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCardTitle = (card: BattleCardListItem) => {
    if (card.competitor_name) {
      return card.competitor_name.length > 30
        ? card.competitor_name.substring(0, 30) + '...'
        : card.competitor_name;
    }
    return `Battle Card #${card.id}`;
  };

  const handleCreateCard = async () => {
    if (!competitorName || !serviceName) {
      return;
    }

    // Close the modal immediately
    setShowNewCardModal(false);
    setCompetitorName('');
    setServiceName('');

    // Call the generate API in the background
    try {
      await generateBattleCard({
        competitor_name: competitorName,
        service_name: serviceName,
      });
    } catch (error) {
      console.error('Failed to create battle card:', error);
    }
  };

  const closeDeleteDialog = () => {
    if (!isDeletingBattleCard) {
      setBattleCardPendingDeletion(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!battleCardPendingDeletion) return;

    try {
      setIsDeletingBattleCard(true);
      await deleteBattleCard(battleCardPendingDeletion.id);
      setBattleCardPendingDeletion(null);
    } catch (error) {
      console.error('Failed to delete battle card', error);
    } finally {
      setIsDeletingBattleCard(false);
    }
  };

  const handleMenuToggle = (cardId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForCard((prev) => (prev === cardId ? null : cardId));
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
    <>
      <div
        className={cn(
          'bg-muted/30 flex flex-col w-full transition-all duration-300',
          isCollapsed ? 'md:w-14 h-14 md:h-full' : 'md:w-80 h-auto md:h-full',
          'md:border-r border-b md:border-b-0',
          className,
        )}
      >
        {/* Collapsed Toggle Button */}
        {isCollapsed && (
          <div className="flex items-center justify-center p-4 h-14 md:h-auto">
            <Button
              onClick={() => onCollapseChange?.(false)}
              size="sm"
              className="bg-black hover:bg-black/80 text-white h-10 px-4 md:w-10 md:p-0"
              aria-label="Open battle cards sidebar"
            >
              <ChevronDown className="h-4 w-4 mr-2 md:hidden" />
              <MoreHorizontal className="h-4 w-4 hidden md:block" />
              <span className="md:hidden">Battle Cards</span>
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
                    Battle Cards ({state.battleCardsList.length})
                  </h3>
                  {state.isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden md:inline">Loading...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCollapseChange?.(true)}
                    className="h-8 w-8 p-0"
                    aria-label="Collapse battle cards sidebar"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setShowNewCardModal(true)}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile: Horizontal Scrollable Battle Cards */}
            <div className="relative md:hidden">
              {!state.battleCardsList.length && !state.isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No battle cards yet</p>
                  <p className="text-xs">Click + to create one</p>
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
                  {state.battleCardsList
                    .filter((card) => card && card.id)
                    .map((card) => {
                      const isSelected = state.activeBattleCard?.id === card.id;

                      return (
                        <Card
                          key={card.id}
                          onClick={() => loadBattleCardDetail(card.id)}
                          className={cn(
                            'p-4 cursor-pointer transition-all hover:bg-accent flex-shrink-0 w-64',
                            isSelected ? 'bg-accent border-primary ring-2 ring-primary/20' : '',
                          )}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium line-clamp-2">
                                    {getCardTitle(card)}
                                  </p>
                                  {card.created_at && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatDate(card.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => handleMenuToggle(card.id, e)}
                                    aria-label="Open card actions"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                  {menuOpenForCard === card.id && (
                                    <div className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background shadow-md">
                                      <button
                                        type="button"
                                        className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpenForCard(null);
                                          setBattleCardPendingDeletion(card);
                                        }}
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
                      );
                    })}
                </div>
              )}
            </div>

            {/* Desktop: Vertical List */}
            <div className="hidden md:flex flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
              {!state.battleCardsList.length && !state.isLoading ? (
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No battle cards yet</p>
                  <p className="text-xs">Click + to create one</p>
                </div>
              ) : (
                state.battleCardsList.length > 0 && (
                  <div className="space-y-1 w-full">
                    {state.battleCardsList
                      .filter((card) => card && card.id)
                      .map((card) => {
                        const isSelected = state.activeBattleCard?.id === card.id;

                        return (
                          <Card
                            key={card.id}
                            className={cn(
                              'p-3 cursor-pointer transition-colors hover:bg-accent',
                              isSelected ? 'bg-accent border-primary' : '',
                            )}
                            onClick={() => loadBattleCardDetail(card.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {getCardTitle(card)}
                                  </p>
                                  {card.created_at && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(card.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => handleMenuToggle(card.id, e)}
                                    aria-label="Open card actions"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                  {menuOpenForCard === card.id && (
                                    <div className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background shadow-md">
                                      <button
                                        type="button"
                                        className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpenForCard(null);
                                          setBattleCardPendingDeletion(card);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={showNewCardModal} onOpenChange={setShowNewCardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Battle Card</DialogTitle>
            <DialogDescription>
              Generate AI-powered competitive intelligence for a competitor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="competitor-name">Competitor Name</Label>
              <Input
                id="competitor-name"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                placeholder="e.g., Glamsquad, Soothe"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="service-name">Service/Product</Label>
              <Input
                id="service-name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., on-demand beauty services"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewCardModal(false);
                setCompetitorName('');
                setServiceName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCard}
              disabled={state.isGenerating || !competitorName || !serviceName}
            >
              {state.isGenerating ? 'Generating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!battleCardPendingDeletion}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
      >
        <DialogContent className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-background px-6 py-5">
          <DialogHeader className="space-y-2">
            <DialogTitle>Delete battle card?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The battle card will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{battleCardPendingDeletion?.competitor_name}
            &quot;? All analysis data will be lost.
          </p>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeletingBattleCard}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingBattleCard}
            >
              {isDeletingBattleCard ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
