'use client';
import React from 'react';
import { WixAnalyticsModule } from '@/components/wix-analytics/wix-analytics-module';
import { WixAnalyticsProvider } from '@/lib/xano/wix-analytics-context';

export default function AnalyticsPage() {
  return (
    <WixAnalyticsProvider>
      <main className="w-full h-full">
        <div className="w-full p-0 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
          <div className="mb-6 px-2">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Multi-platform website analytics and insights
            </p>
          </div>
          <div className="w-full px-2">
            <WixAnalyticsModule className="w-full" />
          </div>
        </div>
      </main>
    </WixAnalyticsProvider>
  );
}
