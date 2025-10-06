'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId],
    }));
  };

  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col items-center border-r border-border bg-muted/30 p-4', className)}>
        <Button
          onClick={() => onCollapseChange(false)}
          size="sm"
          className="bg-black hover:bg-black/80 text-white h-10 w-10 p-0"
          aria-label="Open platforms sidebar"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col border-r border-border bg-muted/30', className)}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Platforms</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapseChange(true)}
            className="h-8 w-8 p-0"
            aria-label="Collapse platforms sidebar"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Platform List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
