'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { BattleCardSidebar } from './battle-card-sidebar';
import { BattleCardContent } from './battle-card-content';

interface BattleCardModuleProps {
  className?: string;
}

export function BattleCardModule({ className }: BattleCardModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useBattleCard();
  const campaigns = Array.isArray(state.campaigns) ? state.campaigns : [];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.isGenerating) {
      return <Badge variant="default">Generating...</Badge>;
    }
    if (state.activeCard) {
      return <Badge variant="default">Active Card</Badge>;
    }
    if (campaigns.length > 0) {
      return <Badge variant="outline">Ready</Badge>;
    }
    return <Badge variant="secondary">No Campaigns</Badge>;
  };

  const getCardCount = () => {
    return campaigns.reduce((total, campaign) => {
      if (Array.isArray(campaign.records)) {
        return total + campaign.records.length;
      }
      return total;
    }, 0);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Battle Card Copilot</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered competitive intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {campaigns.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {campaigns.length} campaigns • {getCardCount()} cards
              </div>
            )}
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <BattleCardSidebar />
            </div>
            <div className="flex-1 min-w-0">
              <BattleCardContent />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
