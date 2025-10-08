'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Linkedin,
  ShieldCheck,
  Building2,
  Share2,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

interface Module {
  id: number;
  name: string;
  icon: LucideIcon;
  userCount: number;
}

const MOCK_ACTIVE_MODULES: Module[] = [
  { id: 4, name: 'LinkedIn Copilot', icon: Linkedin, userCount: 5 },
  { id: 7, name: 'Battle Card', icon: ShieldCheck, userCount: 3 },
  { id: 6, name: 'Call Prep', icon: Building2, userCount: 4 },
  { id: 5, name: 'Social Media', icon: Share2, userCount: 2 },
  { id: 1, name: 'Analytics', icon: BarChart3, userCount: 6 },
];

interface ActiveModulesSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  selectedModuleId?: number | null;
  onSelectModule?: (moduleId: number) => void;
}

export function ActiveModulesSidebar({
  className,
  isCollapsed: propIsCollapsed,
  onCollapseChange,
  selectedModuleId,
  onSelectModule,
}: ActiveModulesSidebarProps) {
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
            aria-label="Open modules sidebar"
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
              <h3 className="text-sm font-medium text-muted-foreground">Your Modules</h3>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Collapse modules sidebar"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modules List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {MOCK_ACTIVE_MODULES.map((module) => {
            const Icon = module.icon;
            const isSelected = selectedModuleId === module.id;

            return (
              <Card
                key={module.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  isSelected ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => onSelectModule?.(module.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{module.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {module.userCount} users
                    </p>
                  </div>
                  {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
