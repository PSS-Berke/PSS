import React from 'react';
import { WixAnalyticsModule } from '@/components/wix-analytics/wix-analytics-module';
import { WixAnalyticsProvider } from '@/lib/xano/wix-analytics-context';

export default function AnalyticsPage() {
  return (
    <WixAnalyticsProvider>
      <main className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Multi-platform website analytics and insights
            </p>
          </div>
          <WixAnalyticsModule className="w-full" />
        </div>
      </main>
    </WixAnalyticsProvider>
  );
}
