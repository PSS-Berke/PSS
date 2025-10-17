'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MoreHorizontal,
  BarChart3,
  Megaphone,
  Briefcase,
  Zap,
  LucideIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [internalCollapsed, setInternalCollapsed] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Handle mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        'bg-muted/30 flex flex-col w-full transition-all duration-300',
        isCollapsed ? 'md:w-14 h-14 md:h-full' : 'md:w-64 lg:w-72 xl:w-80 h-auto md:h-full',
        'md:border-r border-b md:border-b-0',
        className,
      )}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4 h-14 md:h-auto">
          <Button
            onClick={() => setCollapsed(false)}
            size="sm"
            className="bg-black hover:bg-black/80 text-white h-10 px-4 md:w-10 md:p-0"
            aria-label="Open category sidebar"
          >
            <ChevronDown className="h-4 w-4 mr-2 md:hidden" />
            <MoreHorizontal className="h-4 w-4 hidden md:block" />
            <span className="md:hidden">Categories</span>
          </Button>
        </div>
      )}

      {/* Expanded Header & Content */}
      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Collapse category sidebar"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile: Horizontal Scrollable Categories */}
          <div className="relative md:hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all hover:bg-accent flex-shrink-0 w-48',
                      isSelected ? 'bg-accent border-[#C33527] ring-2 ring-[#C33527]/20' : '',
                    )}
                    onClick={() => onSelectCategory?.(category.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-2 rounded-md ${isSelected ? 'bg-[#C33527]/10' : 'bg-muted'}`}
                        >
                          <Icon
                            className={`h-5 w-5 ${isSelected ? 'text-[#C33527]' : 'text-muted-foreground'}`}
                          />
                        </div>
                        {isSelected && <div className="w-2 h-2 bg-[#C33527] rounded-full" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-[#C33527]' : ''}`}>
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.count} {category.count === 1 ? 'module' : 'modules'}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Desktop: Vertical List */}
          <div className="hidden md:flex flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
            <div className="space-y-1 w-full">
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
                      <div
                        className={`p-2 rounded-md ${isSelected ? 'bg-[#C33527]/10' : 'bg-muted'}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isSelected ? 'text-[#C33527]' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${isSelected ? 'text-[#C33527]' : ''}`}
                        >
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
          </div>
        </>
      )}
    </div>
  );
}
