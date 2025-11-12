'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OverviewTab } from './tabs/overview-tab';
import { TweetPerformanceTab } from './tabs/tweet-performance-tab';
import { AudienceInsightsTab } from './tabs/audience-insights-tab';
import { ContentAnalyticsTab } from './tabs/content-analytics-tab';
import { AICopilotTab } from './tabs/ai-copilot-tab';
import { MOCK_TWITTER_DATA } from './mock-data';
import { XMetrics } from '@/@types/analytics';
import { Skeleton } from '../ui/skeleton';
type TwitterAnalyticsPageProps = {
  xMetrics?: XMetrics;
  isLoadingXMetrics: boolean;
};
export function TwitterAnalyticsPage({
  xMetrics: XMetrics,
  isLoadingXMetrics,
}: TwitterAnalyticsPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  if (isLoadingXMetrics) {
    return (
      <div className="w-full h-full space-y-6">
        <div className="sticky top-0 bg-background z-10 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[350px] w-full" />
            <Skeleton className="h-[250px] w-full lg:h-[350px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation */}
        <div className="sticky top-0 bg-background z-10 pb-4">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2 h-auto bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tweets"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tweet Performance
            </TabsTrigger>
            <TabsTrigger
              value="audience"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Audience
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="copilot"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-2 md:col-span-1"
            >
              AI Copilot
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          <TabsContent value="overview" className="m-0">
            <OverviewTab data={MOCK_TWITTER_DATA} xMetrics={XMetrics} />
          </TabsContent>

          <TabsContent value="tweets" className="m-0">
            <TweetPerformanceTab data={MOCK_TWITTER_DATA} />
          </TabsContent>

          <TabsContent value="audience" className="m-0">
            <AudienceInsightsTab data={MOCK_TWITTER_DATA} />
          </TabsContent>

          <TabsContent value="content" className="m-0">
            <ContentAnalyticsTab data={MOCK_TWITTER_DATA} />
          </TabsContent>

          <TabsContent value="copilot" className="m-0">
            <AICopilotTab data={MOCK_TWITTER_DATA} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
