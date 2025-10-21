'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewType = 'dialer' | 'contacts' | 'recent';

interface PhoneHeaderProps {
  currentView: ViewType;
  contactsCount: number;
  callLogsCount: number;
  onSettingsClick: () => void;
}

export const PhoneHeader = ({
  currentView,
  contactsCount,
  callLogsCount,
  onSettingsClick,
}: PhoneHeaderProps) => {
  const getHeaderInfo = () => {
    switch (currentView) {
      case 'dialer':
        return {
          title: 'Dial Pad',
          subtitle: 'Enter a number to make a call',
        };
      case 'contacts':
        return {
          title: 'Contacts',
          subtitle: `${contactsCount} contacts available`,
        };
      case 'recent':
        return {
          title: 'Recent Calls',
          subtitle: `${callLogsCount} calls in history`,
        };
      default:
        return {
          title: 'Phone',
          subtitle: 'Make and receive calls',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6">
      <div>
        <h2 className="font-semibold text-xl text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Online
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="h-8 w-8 p-0"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default PhoneHeader;
