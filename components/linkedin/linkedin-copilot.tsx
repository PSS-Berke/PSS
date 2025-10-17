'use client';

import React from 'react';
import { CampaignSidebar } from './campaign-sidebar';
import { ChatInterface } from './chat-interface';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { Loader2 } from 'lucide-react';

interface LinkedInCopilotProps {
  className?: string;
}

export function LinkedInCopilot({ className }: LinkedInCopilotProps) {
  const { state } = useLinkedIn();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  if (state.isLoading && state.pages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading LinkedIn Copilot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${className}`}>
      <CampaignSidebar isCollapsed={isSidebarCollapsed} onCollapseChange={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <ChatInterface sidebarCollapsed={isSidebarCollapsed} />
      </div>
    </div>
  );
}
