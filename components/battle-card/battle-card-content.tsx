'use client';

import React, { useState } from 'react';
import {
  Target,
  Settings,
  Building2,
  Users,
  Newspaper,
  AlertCircle,
  MessageSquare,
  Zap,
  ArrowRight,
  ClipboardCheck,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { BattleCardDetailDialog } from './battle-card-detail-dialog';
import { BattleCardSettingsDialog } from './battle-card-settings-dialog';
import { cn } from '@/lib/utils';

interface CardSectionProps {
  title: string;
  content: string;
  cardKey: string;
  icon: LucideIcon;
  onCardClick: (title: string, content: string, icon: LucideIcon) => void;
}

function CardSection({ title, content, cardKey, icon: Icon, onCardClick }: CardSectionProps) {
  const summary = content && content.length > 150 ? content.substring(0, 150) + '...' : content;

  return (
    <button
      onClick={() => onCardClick(title, content, Icon)}
      className="group rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:shadow-lg border-t-transparent border-t-[3px] hover:border-t-[#C33527]"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-[#C33527] flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-[#C33527]">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3">{summary || 'No data available'}</p>
      </div>
    </button>
  );
}

interface BattleCardContentProps {
  className?: string;
}

export function BattleCardContent({ className }: BattleCardContentProps) {
  const { state, regenerateBattleCard } = useBattleCard();
  const activeBattleCard = state.activeBattleCard;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    title: string;
    content: string;
    icon?: LucideIcon;
  }>({
    title: '',
    content: '',
  });

  const handleCardClick = (title: string, content: string, icon: LucideIcon) => {
    setSelectedCard({ title, content, icon });
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
          <p className="text-muted-foreground mb-6">
            Create a new battle card to get competitive intelligence
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div key={activeBattleCard.id} className={cn('flex flex-col overflow-y-auto', className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                {activeBattleCard.competitor_name}
              </h1>
              <span className="rounded-full bg-[#C33527] px-3 py-1 text-sm font-semibold text-white">
                Battle Card
              </span>
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
        </div>

        {/* Cards Grid - 2 columns like analytics dashboard */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <CardSection
            title="Company Background"
            content={activeBattleCard.company_overview}
            cardKey="companyBackground"
            icon={Building2}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Key Decision Maker"
            content={activeBattleCard.key_products_services}
            cardKey="keyDecisionMaker"
            icon={Users}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Recent News"
            content={activeBattleCard.recent_news}
            cardKey="recentNews"
            icon={Newspaper}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Potential Pain Points"
            content={activeBattleCard.target_market_icp}
            cardKey="potentialPainPoints"
            icon={AlertCircle}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Talking Points"
            content={activeBattleCard.market_positioning}
            cardKey="talkingPoints"
            icon={MessageSquare}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Differentiation"
            content={activeBattleCard.weaknesses_gaps}
            cardKey="differentiation"
            icon={Zap}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Next Steps"
            content={activeBattleCard.strengths}
            cardKey="nextSteps"
            icon={ArrowRight}
            onCardClick={handleCardClick}
          />
          <CardSection
            title="Preparation Checklist"
            content={activeBattleCard.customer_references}
            cardKey="preparationChecklist"
            icon={ClipboardCheck}
            onCardClick={handleCardClick}
          />
        </div>

        {/* Description below cards */}
        <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
          <p className="text-lg text-gray-600">{activeBattleCard.competitor_service}</p>
        </div>
      </div>

      <BattleCardDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedCard.title}
        content={selectedCard.content}
        icon={selectedCard.icon}
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
