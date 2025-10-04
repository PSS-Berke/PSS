'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Target } from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function BattleCardSidebar() {
  const { state, generateCard, deleteCard, setActiveCard } = useBattleCard();
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  const [serviceName, setServiceName] = useState('');

  const handleCreateCard = async () => {
    if (!competitorName || !serviceName) {
      return;
    }

    try {
      // Get first campaign ID if available
      const campaignId = state.campaigns.length > 0 ? state.campaigns[0].battle_card_campaign_id : null;

      await generateCard({
        competitor_name: competitorName,
        service_name: serviceName,
        battle_card_campaign_id: campaignId,
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
      await deleteCard(cardId);
    } catch (error) {
      console.error('Failed to delete battle card:', error);
    }
  };

  // Flatten all cards from all campaigns
  const allCards = state.campaigns.reduce((cards, campaign) => {
    const records = Array.isArray(campaign.records) ? campaign.records : [];
    return [...cards, ...records];
  }, [] as typeof state.campaigns[0]['records'] extends (infer T)[] ? T[] : never);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Battle Cards</h3>
          <Button
            onClick={() => setShowNewCardModal(true)}
            size="sm"
            className="h-7 w-7 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {allCards.filter(card => card && card.id).map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveCard(card)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                state.activeCard?.id === card.id
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {card.competitor_name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {card.competitor_service}
                  </p>
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
          ))}
        </div>

        {allCards.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No battle cards yet</p>
            <p className="text-xs text-muted-foreground/70">Click + to create one</p>
          </div>
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
