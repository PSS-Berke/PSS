'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CallLog } from '@/@types/phone';

type CallFilterType = 'all' | 'missed' | 'inbound' | 'outbound';
import { CallLogItem } from './CallLogItem';

interface RecentCallsProps {
  filteredCallLogs: CallLog[];
  callFilter: CallFilterType;
  onFilterChange: (filter: CallFilterType) => void;
  missedCallsCount: number;
  formatTimestamp: (timestamp: string) => string;
  formatDuration: (seconds: number) => string;
}

export const RecentCalls = ({
  filteredCallLogs,
  callFilter,
  onFilterChange,
  missedCallsCount,
  formatTimestamp,
  formatDuration,
}: RecentCallsProps) => {
  const filterButtons = [
    { id: 'all' as CallFilterType, label: 'All' },
    { id: 'missed' as CallFilterType, label: 'Missed', count: missedCallsCount },
    { id: 'inbound' as CallFilterType, label: 'Incoming' },
    { id: 'outbound' as CallFilterType, label: 'Outgoing' },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filterButtons.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'px-3 py-2 rounded-lg transition-colors font-medium text-xs',
              callFilter === filter.id
                ? 'bg-[#C33527] text-white'
                : 'bg-muted text-foreground hover:bg-muted/80',
            )}
          >
            {filter.label}
            {filter.count !== undefined && filter.count > 0 && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  callFilter === filter.id ? 'bg-white/20' : 'bg-background',
                )}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredCallLogs.map((log) => (
          <CallLogItem
            key={log.id}
            callLog={log}
            formatTimestamp={formatTimestamp}
            formatDuration={formatDuration}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentCalls;
