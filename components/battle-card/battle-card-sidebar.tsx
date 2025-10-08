'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Target, MoreHorizontal, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { cn } from '@/lib/utils';
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

export function BattleCardSidebar({ className, isCollapsed, onCollapseChange }: BattleCardSidebarProps) {
  const { state, generateBattleCard, deleteBattleCard, loadBattleCardDetail } = useBattleCard();
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [menuOpenForCard, setMenuOpenForCard] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleCreateCard = async () => {
    if (!competitorName || !serviceName) {
      return;
    }

    try {
      await generateBattleCard({
        competitor_name: competitorName,
        service_name: serviceName,
      });
      setShowNewCardModal(false);
      setCompetitorName('');
      setServiceName('');
    } catch (error) {
      console.error('Failed to create battle card:', error);
    }
  };

  const handleDeleteCard = async (cardId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this battle card?')) {
      return;
    }

    try {
      await deleteBattleCard(cardId);
    } catch (error) {
      console.error('Failed to delete battle card:', error);
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
          className
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
                <h3 className="text-sm font-medium text-muted-foreground">
                  Battle Cards ({state.battleCardsList.length})
                </h3>
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
                  {state.battleCardsList.filter(card => card && card.id).map((card) => {
                    const preview = card.competitor_overview?.substring(0, 50) || '';
                    const isSelected = state.activeBattleCard?.id === card.id;

                    return (
                      <Card
                        key={card.id}
                        onClick={() => loadBattleCardDetail(card.id)}
                        className={cn(
                          'p-4 cursor-pointer transition-all hover:bg-accent flex-shrink-0 w-64',
                          isSelected
                            ? 'bg-accent border-primary ring-2 ring-primary/20'
                            : ''
                        )}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium line-clamp-2">
                                  {card.competitor_name}
                                </h4>
                                {preview && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {preview}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isSelected && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
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
                                      onClick={(e) => handleDeleteCard(card.id, e)}
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
            <div className="hidden md:flex flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {state.battleCardsList.filter(card => card && card.id).map((card) => {
                const preview = card.competitor_overview?.substring(0, 50) || '';
                const isSelected = state.activeBattleCard?.id === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => loadBattleCardDetail(card.id)}
                    className={cn(
                      'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-accent border-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-sm truncate",
                          isSelected ? "font-medium text-foreground" : "font-medium text-foreground"
                        )}>
                          {card.competitor_name}
                        </h4>
                        {preview && (
                          <p className="text-xs text-muted-foreground truncate">
                            {preview}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteCard(card.id, e)}
                        className="h-7 w-7 p-0 ml-2 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {state.battleCardsList.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No battle cards yet</p>
                  <p className="text-xs text-muted-foreground/70">Click + to create one</p>
                </div>
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
    </>
  );
}
