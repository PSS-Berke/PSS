'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { Button } from '@/components/ui/button';

interface CardSectionProps {
  title: string;
  content: string;
  cardKey: string;
}

function CardSection({ title, content, cardKey }: CardSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const summary = content && content.length > 100 ? content.substring(0, 100) + '...' : content;

  // Reset expanded state when content changes
  React.useEffect(() => {
    setIsExpanded(false);
  }, [content]);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all h-full"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-bold">{title}</CardTitle>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-2">Summary:</p>
          <p className="leading-relaxed">
            {isExpanded ? (content || 'No data available') : (summary || 'No data available')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BattleCardContent() {
  const { state } = useBattleCard();
  const activeBattleCard = state.activeBattleCard;

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
    <div key={activeBattleCard.id} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {activeBattleCard.competitor_name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {activeBattleCard.competitor_service}
        </p>
      </div>

      {/* Battle Card Grid - 4 wide, 2 high */}
      <div className="grid grid-cols-4 grid-rows-2 gap-4">
        <CardSection
          title="Company Background"
          content={activeBattleCard.company_overview}
          cardKey="companyBackground"
        />
        <CardSection
          title="Key Decision Maker"
          content={activeBattleCard.key_products_services}
          cardKey="keyDecisionMaker"
        />
        <CardSection
          title="Recent News"
          content={activeBattleCard.recent_news}
          cardKey="recentNews"
        />
        <CardSection
          title="Potential Pain Points"
          content={activeBattleCard.target_market_icp}
          cardKey="potentialPainPoints"
        />
        <CardSection
          title="Talking Points"
          content={activeBattleCard.market_positioning}
          cardKey="talkingPoints"
        />
        <CardSection
          title="Differentiation"
          content={activeBattleCard.weaknesses_gaps}
          cardKey="differentiation"
        />
        <CardSection
          title="Next Steps"
          content={activeBattleCard.strengths}
          cardKey="nextSteps"
        />
        <CardSection
          title="Preparation Checklist"
          content={activeBattleCard.customer_references}
          cardKey="preparationChecklist"
        />
      </div>
    </div>
  );
}
