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

export default function DashboardPage() {
  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">All your modules in one place</p>
        </div>

        <div className="space-y-6 w-full">
          <LinkedInProvider>
            <LinkedInModule />
          </LinkedInProvider>

          <SocialMediaProvider>
            <SocialMediaModule />
          </SocialMediaProvider>

          <CallPrepProvider>
            <CallPrepModule />
          </CallPrepProvider>

          <BattleCardProvider>
            <BattleCardModule />
          </BattleCardProvider>
        </div>
      </div>
    </main>
  );
}
