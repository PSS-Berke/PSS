'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PLATFORMS } from './mock-data';

interface PlatformSidebarProps {
  className?: string;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  selectedPlatform: string | null;
  selectedCategory: string | null;
  onSelectCategory: (platformId: string, categoryKey: string) => void;
}

export function PlatformSidebar({
  className,
  isCollapsed,
  onCollapseChange,
  selectedPlatform,
  selectedCategory,
  onSelectCategory,
}: PlatformSidebarProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<string, boolean>>({
    wix: true,
  });
  const [expandedMobilePlatform, setExpandedMobilePlatform] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoriesScrollContainerRef = useRef<HTMLDivElement>(null);

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }));
  };

  if (isCollapsed) {
    return (
      <div className={cn(
        'flex flex-col items-center bg-muted/30 p-4 transition-all duration-300',
        'md:border-r h-14 md:h-full border-b md:border-b-0',
        className
      )}>
        <Button
          onClick={() => onCollapseChange(false)}
          size="sm"
          className="bg-black hover:bg-black/80 text-white h-10 px-4 md:w-10 md:p-0"
          aria-label="Open platforms sidebar"
        >
          <ChevronDown className="h-4 w-4 mr-2 md:hidden" />
          <MoreHorizontal className="h-4 w-4 hidden md:block" />
          <span className="md:hidden">Platforms</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col bg-muted/30 transition-all duration-300', 'md:border-r border-b md:border-b-0 h-auto md:h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Platforms ({PLATFORMS.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapseChange(true)}
            className="h-8 w-8 p-0"
            aria-label="Collapse platforms sidebar"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile: Horizontal Scrollable Platforms */}
      <div className="relative md:hidden flex flex-col">
        {/* First level: Platforms */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {PLATFORMS.map((platform) => {
            const isExpanded = expandedMobilePlatform === platform.id;
            const hasSelectedCategory = platform.categories.some(cat => cat.key === selectedCategory);

            return (
              <Card
                key={platform.id}
                className={`flex-shrink-0 w-64 p-4 transition-all hover:shadow-md ${
                  hasSelectedCategory || isExpanded ? 'bg-accent border-primary shadow-sm' : ''
                }`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedMobilePlatform(isExpanded ? null : platform.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{platform.label}</h4>
                    <Badge variant="outline" className="text-xs">
                      {platform.categories.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {platform.categories.length} categories
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Second level: Expanded platform categories */}
        {expandedMobilePlatform && (
          <div className="border-t bg-muted/20">
            <div className="px-4 py-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                {PLATFORMS.find(p => p.id === expandedMobilePlatform)?.label} - Categories
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setExpandedMobilePlatform(null)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div
              ref={categoriesScrollContainerRef}
              className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {PLATFORMS.find(p => p.id === expandedMobilePlatform)?.categories.map((category) => {
                const isSelected = selectedCategory === category.key;
                return (
                  <Card
                    key={category.id}
                    className={`flex-shrink-0 w-64 p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'bg-accent border-primary shadow-sm' : ''
                    }`}
                    onClick={() => {
                      onSelectCategory(expandedMobilePlatform, category.key);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate mb-1">
                          {category.label}
                        </p>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Vertical Platform List */}
      <div className="hidden md:block flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {PLATFORMS.map((platform) => {
          const isExpanded = expandedPlatforms[platform.id];

          return (
            <div key={platform.id} className="space-y-2">
              {/* Platform Header */}
              <div
                className="flex items-start gap-1 flex-1 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                onClick={() => togglePlatform(platform.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <h4 className="font-medium text-sm text-foreground break-words flex-1 min-w-0">
                  {platform.label}
                </h4>
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                  ({platform.categories.length})
                </span>
              </div>

              {/* Categories */}
              {isExpanded && (
                <div className="space-y-1 ml-2 pl-3 border-l-2 border-muted">
                  {platform.categories.map((category) => {
                    const isSelected = selectedCategory === category.key;

                    return (
                      <button
                        key={category.id}
                        onClick={() => onSelectCategory(platform.id, category.key)}
                        className={cn(
                          'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                          isSelected
                            ? 'bg-accent border-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
