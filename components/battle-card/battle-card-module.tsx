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
    if (state.activeBattleCard) {
      return <Badge variant="default">Active Card</Badge>;
    }
    if (state.battleCardsList.length > 0) {
      return <Badge variant="outline">Ready</Badge>;
    }
    return <Badge variant="secondary">No Cards</Badge>;
  };

  return (
    <Card className={`w-full ${className} relative`}>
      {/* Expand Button - Positioned in top-right corner */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-[32px] right-[12px] z-10 px-[17px] py-3"
        onClick={toggleExpanded}
      >
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between pr-28">
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

          <div className="flex items-center gap-3 pr-2">
            <div className="px-1">
              {getStatusBadge()}
            </div>
            {state.battleCardsList.length > 0 && (
              <div className="text-sm text-muted-foreground px-1">
                {state.battleCardsList.length} battle {state.battleCardsList.length === 1 ? 'card' : 'cards'}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex gap-6">
            <div className="w-80 flex-shrink-0">
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
