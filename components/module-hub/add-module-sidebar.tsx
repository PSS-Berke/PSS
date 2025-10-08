'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MoreHorizontal,
  BarChart3,
  Megaphone,
  Briefcase,
  Zap,
  LucideIcon,
} from 'lucide-react';

type CategoryType = 'all' | 'analytics' | 'marketing' | 'sales' | 'productivity';

interface Category {
  id: CategoryType;
  name: string;
  icon: LucideIcon;
  count: number;
}

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Modules', icon: MoreHorizontal, count: 6 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, count: 1 },
  { id: 'marketing', name: 'Marketing', icon: Megaphone, count: 2 },
  { id: 'sales', name: 'Sales', icon: Briefcase, count: 2 },
  { id: 'productivity', name: 'Productivity', icon: Zap, count: 1 },
];

interface AddModuleSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  selectedCategory?: CategoryType;
  onSelectCategory?: (category: CategoryType) => void;
}

export function AddModuleSidebar({
  className,
  isCollapsed: propIsCollapsed,
  onCollapseChange,
  selectedCategory,
  onSelectCategory,
}: AddModuleSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const isControlled = typeof propIsCollapsed !== 'undefined';
  const isCollapsed = isControlled ? (propIsCollapsed as boolean) : internalCollapsed;

  const setCollapsed = (value: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(value);
    }
    try {
      if (typeof onCollapseChange === 'function') onCollapseChange(value);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      className={`${isCollapsed ? 'w-14' : 'w-80'} border-r bg-muted/30 flex flex-col h-full transition-all duration-300 ${className ?? ''}`}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4">
          <Button
            onClick={() => setCollapsed(false)}
            size="sm"
            className="bg-black hover:bg-black/80 text-white h-10 w-10 p-0"
            aria-label="Open category sidebar"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Collapse category sidebar"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <Card
                key={category.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  isSelected ? 'bg-accent border-[#C33527]' : ''
                }`}
                onClick={() => onSelectCategory?.(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-[#C33527]/10' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-[#C33527]' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-[#C33527]' : ''}`}>
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count} {category.count === 1 ? 'module' : 'modules'}
                    </p>
                  </div>
                  {isSelected && <div className="w-2 h-2 bg-[#C33527] rounded-full" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
