'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Twitter, ChevronDown, ChevronUp, X, Radio } from 'lucide-react';
import { TwitterAnalyticsPage } from './twitter-analytics-page';
import { useAuth } from '@/lib/xano/auth-context';
import useSWR from 'swr';
import { XMetrics, XTweetsResponse } from '@/@types/analytics';
import { apiGetXMetrics, apiGetXTweetsMetrics } from '@/lib/services/XMetricsService';

interface TwitterAnalyticsModuleProps {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function TwitterAnalyticsModule({
  className,
  onExpandedChange,
}: TwitterAnalyticsModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const companyId = user?.company_id || 0;

  const {
    data: xMetrics,
    error: xMetricsError,
    isLoading: isLoadingXMetrics,
    mutate: mutateXMetrics,
  } = useSWR<XMetrics>('/api:pEDfedqJ/twitter/user/analytics', () =>
    apiGetXMetrics({ company_id: companyId }),
  );

  const {
    data: xTweetsMetrics,
    error: xTweetsMetricsError,
    isLoading: isLoadingXTweetsMetrics,
    mutate: mutateXTweetsMetrics,
  } = useSWR<XTweetsResponse>('/api:pEDfedqJ/twitter/user/engagement_analytics', () =>
    apiGetXTweetsMetrics({ company_id: companyId }),
  );

  console.log({ xTweetsMetrics, isLoadingXTweetsMetrics, xTweetsMetricsError });
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  const getStatusBadge = () => {
    // Mock: would check actual connection status
    return <Badge variant="outline">Connected</Badge>;
  };

  const modalContent =
    isExpanded && mounted ? (
      <div
        className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm"
        onClick={toggleExpanded}
      >
        <div
          className="fixed inset-4 md:inset-8 z-[10000] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="h-full flex flex-col">
            <CardHeader
              className="flex-shrink-0 border-b cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={toggleExpanded}
            >
              <div className="flex items-center justify-between flex-col md:flex-row gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Twitter className="h-5 w-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">X (Twitter) Analytics Copilot</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track your Twitter performance and audience insights
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    {getStatusBadge()}
                  </div>
                  <Button variant="ghost" size="sm" onClick={toggleExpanded} className="ml-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-auto p-6">
                <TwitterAnalyticsPage
                  xMetrics={xMetrics}
                  xTweetsMetrics={xTweetsMetrics}
                  isLoadingXMetrics={isLoadingXMetrics}
                  isLoadingXTweetsMetrics={isLoadingXTweetsMetrics}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : null;

  return (
    <>
      <Card className={`w-full ${className}`}>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-3 p-4 md:p-6"
          onClick={toggleExpanded}
        >
          {/* Left Section: Icon + Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-black dark:bg-white rounded-lg flex-shrink-0">
              <Twitter className="h-5 w-5 text-white dark:text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg truncate">
                X (Twitter) Analytics Copilot
              </CardTitle>
              <p className="text-sm text-muted-foreground hidden md:block">
                Track your Twitter performance and audience insights
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
      </Card>

      {/* Modal rendered via Portal to document.body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
