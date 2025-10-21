'use client';

import React from 'react';
import { Phone, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ViewType = 'dialer' | 'contacts' | 'recent';

interface NavigationTabsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  contactsCount: number;
  missedCallsCount: number;
  isMobile?: boolean;
}

export const NavigationTabs = ({
  currentView,
  onViewChange,
  contactsCount,
  missedCallsCount,
  isMobile = false,
}: NavigationTabsProps) => {
  if (isMobile) {
    return (
      <div className="border-t border-border bg-card">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button
            onClick={() => onViewChange('dialer')}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-lg transition-colors',
              currentView === 'dialer'
                ? 'bg-[#C33527] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Dial</span>
          </button>
          <button
            onClick={() => onViewChange('contacts')}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative',
              currentView === 'contacts'
                ? 'bg-[#C33527] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Contacts</span>
            <Badge
              className="absolute top-0 right-2 h-5 min-w-5 px-1 text-[10px]"
              variant="secondary"
            >
              {contactsCount}
            </Badge>
          </button>
          <button
            onClick={() => onViewChange('recent')}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative',
              currentView === 'recent'
                ? 'bg-[#C33527] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Recent</span>
            {missedCallsCount > 0 && (
              <Badge className="absolute top-0 right-2 h-5 min-w-5 px-1 text-[10px] bg-red-500 hover:bg-red-600 text-white">
                {missedCallsCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Desktop sidebar navigation
  return (
    <div className="space-y-1">
      <button
        onClick={() => onViewChange('dialer')}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
          currentView === 'dialer' ? 'bg-[#C33527] text-white' : 'text-foreground hover:bg-muted',
        )}
      >
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5" />
          <span className="font-medium text-sm">Dial Pad</span>
        </div>
      </button>

      <button
        onClick={() => onViewChange('contacts')}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
          currentView === 'contacts' ? 'bg-[#C33527] text-white' : 'text-foreground hover:bg-muted',
        )}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" />
          <span className="font-medium text-sm">Contacts</span>
        </div>
        <Badge variant={currentView === 'contacts' ? 'secondary' : 'outline'} className="text-xs">
          {contactsCount}
        </Badge>
      </button>

      <button
        onClick={() => onViewChange('recent')}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
          currentView === 'recent' ? 'bg-[#C33527] text-white' : 'text-foreground hover:bg-muted',
        )}
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5" />
          <span className="font-medium text-sm">Recent Calls</span>
        </div>
        {missedCallsCount > 0 && (
          <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
            {missedCallsCount}
          </Badge>
        )}
      </button>
    </div>
  );
};

export default NavigationTabs;
