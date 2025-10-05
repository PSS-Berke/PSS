"use client";

import React from 'react';
import { CallPrepModule } from '@/components/call-prep/call-prep-module';
import { BattleCardModule } from '@/components/battle-card/battle-card-module';
import { LinkedInModule } from '@/components/linkedin/linkedin-module';
import { SocialMediaModule } from '@/components/social/social-media-module';
import { CallPrepProvider } from '@/lib/xano/call-prep-context';
import { BattleCardProvider } from '@/lib/xano/battle-card-context';
import { LinkedInProvider } from '@/lib/xano/linkedin-context';
import { SocialMediaProvider } from '@/lib/xano/social-media-context';
import { useUser } from '@/lib/xano/auth-context';

const MODULE_CONFIG = {
  5: { // social-media-copilot
    component: (
      <SocialMediaProvider>
        <SocialMediaModule />
      </SocialMediaProvider>
    )
  },
  4: { // linkedin-copilot
    component: (
      <LinkedInProvider>
        <LinkedInModule />
      </LinkedInProvider>
    )
  },
  6: { // call copilot
    component: (
      <CallPrepProvider>
        <CallPrepModule />
      </CallPrepProvider>
    )
  },
  7: { // battle card copilot
    component: (
      <BattleCardProvider>
        <BattleCardModule />
      </BattleCardProvider>
    )
  }
} as const;

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <main className="w-full h-full">
        <div className="w-full p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Loading your modules...</p>
          </div>
        </div>
      </main>
    );
  }

  // Get user's module IDs
  const userModuleIds = user?.modules?.map(m => m.id) || [];

  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">All your modules in one place</p>
        </div>

        <div className="space-y-6 w-full">
          {userModuleIds.map((moduleId) => {
            const moduleConfig = MODULE_CONFIG[moduleId as keyof typeof MODULE_CONFIG];
            return moduleConfig ? (
              <React.Fragment key={moduleId}>
                {moduleConfig.component}
              </React.Fragment>
            ) : null;
          })}
        </div>
      </div>
    </main>
  );
}
