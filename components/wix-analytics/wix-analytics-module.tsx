'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, ChevronDown, ChevronUp, X, Radio, Globe } from 'lucide-react';
import { PlatformSidebar } from './platform-sidebar';
import { AnalyticsDashboard } from './analytics-dashboard';
import { MOCK_ANALYTICS_DATA, PLATFORMS } from './mock-data';

interface WixAnalyticsModuleProps {
  className?: string;
}

export function WixAnalyticsModule({ className }: WixAnalyticsModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>('wix');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('wix-overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectCategory = (platformId: string, categoryKey: string) => {
    setSelectedPlatform(platformId);
    setSelectedCategory(categoryKey);
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
    const connectedPlatforms = PLATFORMS.length;
    return (
      <Badge variant="outline">
        {connectedPlatforms} platforms available
      </Badge>
    );
  };

  const getCurrentCategoryData = () => {
    if (!selectedCategory) return null;
    return MOCK_ANALYTICS_DATA[selectedCategory] || null;
  };

  const modalContent = isExpanded && mounted ? (
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Website Analytics Copilot</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Multi-platform website analytics & insights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  {getStatusBadge()}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {PLATFORMS.length} platforms
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-6">
            <div className="flex gap-6 h-full">
              <div
                className={`${
                  isSidebarCollapsed ? 'w-14' : 'w-80'
                } flex-shrink-0 transition-all duration-300 h-full`}
              >
                <PlatformSidebar
                  className="h-full"
                  isCollapsed={isSidebarCollapsed}
                  onCollapseChange={setIsSidebarCollapsed}
                  selectedPlatform={selectedPlatform}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                />
              </div>
              <div className="flex-1 min-w-0 h-full overflow-auto">
                <AnalyticsDashboard
                  categoryData={getCurrentCategoryData()}
                  className="h-full"
                />
              </div>
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
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg truncate">Website Analytics Copilot</CardTitle>
              <p className="text-sm text-muted-foreground hidden md:block">
                Multi-platform website analytics & insights
              </p>
            </div>
          </div>

          {/* Right Section: Badges (hidden on mobile) + Expand Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status info - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-muted-foreground" />
              </div>
              {getStatusBadge()}
              <div className="flex text-sm text-muted-foreground items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {PLATFORMS.length}
              </div>
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
