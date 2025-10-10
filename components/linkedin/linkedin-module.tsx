'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ChevronDown, ChevronUp, Megaphone, MessagesSquare, Radio } from 'lucide-react';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { ChatInterface } from './chat-interface';
import { CampaignSidebar } from './campaign-sidebar';

interface LinkedInModuleProps {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function LinkedInModule({ className, onExpandedChange }: LinkedInModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useLinkedIn();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pages = Array.isArray(state.pages) ? state.pages : [];

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.currentSession) {
      return <Badge variant="default">Active Session</Badge>;
    }
    if (pages.length > 0) {
      return <Badge variant="outline">Ready</Badge>;
    }
    return <Badge variant="secondary">No Campaigns</Badge>;
  };

  const getCampaignCount = () => {
    return pages.filter(page => page.linkedin_campaigns_id !== null).length;
  };

  const getSessionCount = () => {
    return pages.reduce((total, page) => {
      if (Array.isArray(page.records)) {
        return total + page.records.length;
      }
      return total;
    }, 0);
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
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg truncate">LinkedIn Copilot</CardTitle>
            <p className="text-sm text-muted-foreground hidden md:block">
              AI-powered LinkedIn content creation
            </p>
          </div>
        </div>

        {/* Right Section: Badges (hidden on mobile) + Expand Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status info - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 pr-6">
            <div className="flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-muted-foreground" />
            </div>
            {getStatusBadge()}
            {pages.length > 0 && (
              <div className="flex text-sm text-muted-foreground items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4" />
                  {getCampaignCount()}
                </div>
                <div className="flex items-center gap-1.5">
                  <MessagesSquare className="h-4 w-4" />
                  {getSessionCount()}
                </div>
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
          {/* Mobile Layout: Stack vertically with sidebar on top, chat always 500px */}
          <div className="flex flex-col md:hidden">
            <div className="flex-shrink-0">
              <CampaignSidebar
                isCollapsed={isSidebarCollapsed}
                onCollapseChange={setIsSidebarCollapsed}
              />
            </div>
            <div className="h-[500px] w-full">
              <ChatInterface sidebarCollapsed={isSidebarCollapsed} />
            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden md:flex h-[600px]">
            <div className={`${isSidebarCollapsed ? 'w-14' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
              <CampaignSidebar className="h-full" isCollapsed={isSidebarCollapsed} onCollapseChange={setIsSidebarCollapsed} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden p-6">
              <ChatInterface className="h-full" sidebarCollapsed={isSidebarCollapsed} />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}