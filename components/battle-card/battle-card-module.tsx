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
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function BattleCardModule({ className, onExpandedChange }: BattleCardModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { state } = useBattleCard();

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.isGenerating) {
      return (
        <Badge variant="default" className="animate-pulse">
          Generating Battle Card...
        </Badge>
      );
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

        {/* Right Section: Badges + Expand Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status info - compact on mobile, full on desktop */}
          <div className="flex items-center gap-1.5 md:gap-2 md:pr-6">
            {/* Activity icon - hidden on mobile to save space */}
            <div className="hidden md:flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            {getStatusBadge()}
            {/* Card count - hidden on mobile to save space */}
            {state.battleCardsList.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {state.battleCardsList.length} battle{' '}
                {state.battleCardsList.length === 1 ? 'card' : 'cards'}
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
        <CardContent className="p-0 relative">
          {/* Generation Loading Overlay */}
          {state.isGenerating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Generating Battle Card...</h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    Analyzing competitive intelligence and strategic insights
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Layout: Stack vertically */}
          <div className="flex flex-col md:hidden h-[500px]">
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
            <div
              className={`${isSidebarCollapsed ? 'w-14' : 'w-80'} flex-shrink-0 transition-all duration-300`}
            >
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
