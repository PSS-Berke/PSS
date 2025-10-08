'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ChevronDown, ChevronUp, Activity, FileText } from 'lucide-react';
import { useBattleCard } from '@/lib/xano/battle-card-context';
import { BattleCardSidebar } from './battle-card-sidebar';
import { BattleCardContent } from './battle-card-content';

interface BattleCardModuleProps {
  className?: string;
}

export function BattleCardModule({ className }: BattleCardModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
  <Card className={`w-full ${className}`}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-3 p-4 md:p-6"
        onClick={toggleExpanded}
      >
        {/* Left Section: Icon + Title */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg truncate">Battle Card Copilot</CardTitle>
            <p className="text-sm text-muted-foreground hidden md:block">
              AI-powered competitive intelligence
            </p>
          </div>
        </div>

        {/* Right Section: Badges (hidden on mobile) + Expand Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status info - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            {getStatusBadge()}
            {state.battleCardsList.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {state.battleCardsList.length} battle {state.battleCardsList.length === 1 ? 'card' : 'cards'}
              </div>
            )}
          </div>

          {/* Expand button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-9 w-9 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          {/* Mobile Layout: Stack vertically */}
          <div className="flex flex-col md:hidden min-h-[50vh] px-4">
            <BattleCardSidebar
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={setIsSidebarCollapsed}
            />
            <div className="flex-1 overflow-y-auto p-6 w-full">
              <BattleCardContent />
            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden md:flex h-[600px]">
            <div className={`${isSidebarCollapsed ? 'w-14' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
              <BattleCardSidebar
                isCollapsed={isSidebarCollapsed}
                onCollapseChange={setIsSidebarCollapsed}
              />
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto p-6">
              <BattleCardContent />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
