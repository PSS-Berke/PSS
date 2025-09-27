'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { ChatInterface } from './chat-interface';
import { CampaignSidebar } from './campaign-sidebar';

interface LinkedInModuleProps {
  className?: string;
}

export function LinkedInModule({ className }: LinkedInModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state } = useLinkedIn();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return <Badge variant="secondary">Loading...</Badge>;
    }
    if (state.currentSession) {
      return <Badge variant="default">Active Session</Badge>;
    }
    if (state.pages.length > 0) {
      return <Badge variant="outline">Ready</Badge>;
    }
    return <Badge variant="secondary">No Campaigns</Badge>;
  };

  const getSessionCount = () => {
    return state.pages.reduce((total, page) => {
      if (Array.isArray(page.records)) {
        return total + page.records.length;
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
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">LinkedIn Copilot</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered LinkedIn content creation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {state.pages.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {state.pages.length} campaigns • {getSessionCount()} chats
              </div>
            )}
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="flex h-[600px] border-t">
            <CampaignSidebar className="w-80" />
            <div className="flex-1">
              <ChatInterface />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
