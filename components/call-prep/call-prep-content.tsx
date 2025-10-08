'use client';

import React, { useState } from 'react';
import { Building2, Users, Newspaper, AlertCircle, MessageSquare, Zap, ArrowRight, ClipboardCheck, Settings, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { CallPrepDetailDialog } from './call-prep-detail-dialog';
import { EnrichedDetailDialog } from './enriched-detail-dialog';
import { CallPrepSettingsDialog } from './call-prep-settings-dialog';
import { cn } from '@/lib/utils';

interface CardSectionProps {
  title: string;
  content: string;
  cardKey: string;
  icon: LucideIcon;
  disabled?: boolean;
  onCardClick: (title: string, content: string, cardKey: string, icon: LucideIcon) => void;
}

function CardSection({ title, content, cardKey, icon: Icon, onCardClick, disabled = false }: CardSectionProps) {
  const summary = content && content.length > 150 ? content.substring(0, 150) + '...' : content;

  return (
    <button
      onClick={() => onCardClick(title, content, cardKey, Icon)}
      disabled={disabled}
      className={cn(
        'group rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all border-t-transparent border-t-[3px]',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-lg hover:border-t-[#C33527]'
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-[#C33527] flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-[#C33527]">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3">
          {summary || 'No data available'}
        </p>
      </div>
    </button>
  );
}

interface CallPrepContentProps {
  className?: string;
}

export function CallPrepContent({ className }: CallPrepContentProps) {
  const { state, generateCallPrep } = useCallPrep();
  const analysis = state.latestAnalysis;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrichedDialogOpen, setEnrichedDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ title: string; content: string; cardKey: string; icon?: LucideIcon }>({
    title: '',
    content: '',
    cardKey: '',
  });

  const handleCardClick = (title: string, content: string, cardKey: string, icon: LucideIcon) => {
    setSelectedCard({ title, content, cardKey, icon });

    // Check if this card should use enriched dialog
    if (cardKey === 'keyDecisionMakers' || cardKey === 'companyBackground') {
      setEnrichedDialogOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleRefreshCallPrep = async (prompt: string) => {
    await generateCallPrep(prompt);
  };

  if (state.error) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-6 py-4 text-sm text-destructive max-w-md">
            {state.error}
          </div>
        </div>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading call prep...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <Building2 className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Call Prep Available</h3>
          <p className="text-muted-foreground mb-6">Click &quot;Generate Call Prep&quot; to create a new analysis</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div key={analysis.id} className={cn('flex flex-col overflow-y-auto', className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                Call Preparation
              </h1>
              <span className="rounded-full bg-[#C33527] px-3 py-1 text-sm font-semibold text-white">
                Ready
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettingsClick}
              className="h-8 w-8"
              aria-label="Call prep settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cards Grid - 2 columns like battle card */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <CardSection
            title="Company Background"
            content={analysis.company_background}
            cardKey="companyBackground"
            icon={Building2}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Key Decision Makers"
            content={analysis.key_decision_makers}
            cardKey="keyDecisionMakers"
            icon={Users}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Recent News & Initiatives"
            content={analysis.recent_news_initiatives}
            cardKey="recentNews"
            icon={Newspaper}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Potential Pain Points"
            content={analysis.potential_pain_points}
            cardKey="potentialPainPoints"
            icon={AlertCircle}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Strategic Talking Points"
            content={analysis.strategic_talking_points_for_sales_call}
            cardKey="talkingPoints"
            icon={MessageSquare}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Value Propositions"
            content={analysis.suggested_value_propositions}
            cardKey="valueProps"
            icon={Zap}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Call Action Plan"
            content={analysis.call_action_plan}
            cardKey="actionPlan"
            icon={ArrowRight}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
          <CardSection
            title="Preparation Tips"
            content={analysis.preparation_tip}
            cardKey="preparationTips"
            icon={ClipboardCheck}
            onCardClick={handleCardClick}
            disabled={dialogOpen || enrichedDialogOpen}
          />
        </div>
      </div>

      <CallPrepDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedCard.title}
        content={selectedCard.content}
        icon={selectedCard.icon}
      />

      <EnrichedDetailDialog
        open={enrichedDialogOpen}
        onOpenChange={setEnrichedDialogOpen}
        title={selectedCard.title}
        content={selectedCard.content}
        cardKey={selectedCard.cardKey}
        icon={selectedCard.icon}
        companyBackgroundContent={analysis?.company_background}
      />

      <CallPrepSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        analysis={analysis}
        onRefresh={handleRefreshCallPrep}
      />
    </>
  );
}
