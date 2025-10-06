'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { BattleCardDetailDialog } from './battle-card-detail-dialog';
import { BattleCardSettingsDialog } from './battle-card-settings-dialog';

interface CardSectionProps {
  title: string;
  content: string;
  cardKey: string;
  onCardClick: (title: string, content: string) => void;
}

function CardSection({ title, content, cardKey, onCardClick }: CardSectionProps) {
  const summary = content && content.length > 100 ? content.substring(0, 100) + '...' : content;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all h-full"
      onClick={() => onCardClick(title, content)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Summary:</p>
          <p className="leading-relaxed">
            {summary || 'No data available'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BattleCardContent() {
  const { state, regenerateBattleCard } = useBattleCard();
  const activeBattleCard = state.activeBattleCard;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  });

  const handleCardClick = (title: string, content: string) => {
    setSelectedCard({ title, content });
    setDialogOpen(true);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleRefreshBattleCard = async (competitorName: string, serviceName: string) => {
    if (!activeBattleCard) return;
    await regenerateBattleCard(activeBattleCard.id, competitorName, serviceName);
  };

  if (state.isLoadingDetail) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading battle card...</p>
        </div>
      </div>
    );
  }

  if (!activeBattleCard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Target className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Battle Card Selected</h3>
          <p className="text-muted-foreground mb-6">Create a new battle card to get competitive intelligence</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div key={activeBattleCard.id} className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {activeBattleCard.competitor_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeBattleCard.competitor_service}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className="h-8 w-8"
            aria-label="Battle card settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Battle Card Grid - 4 wide, 2 high */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4">
          <CardSection
            title="Company Background"
            content={activeBattleCard.company_overview}
            cardKey="companyBackground"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Key Decision Maker"
            content={activeBattleCard.key_products_services}
            cardKey="keyDecisionMaker"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Recent News"
            content={activeBattleCard.recent_news}
            cardKey="recentNews"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Potential Pain Points"
            content={activeBattleCard.target_market_icp}
            cardKey="potentialPainPoints"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Talking Points"
            content={activeBattleCard.market_positioning}
            cardKey="talkingPoints"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Differentiation"
            content={activeBattleCard.weaknesses_gaps}
            cardKey="differentiation"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Next Steps"
            content={activeBattleCard.strengths}
            cardKey="nextSteps"
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Preparation Checklist"
            content={activeBattleCard.customer_references}
            cardKey="preparationChecklist"
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      <BattleCardDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedCard.title}
        content={selectedCard.content}
      />

      <BattleCardSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        battleCard={activeBattleCard}
        onRefresh={handleRefreshBattleCard}
      />
    </>
  );
}
