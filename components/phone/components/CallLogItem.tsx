'use client';

import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CallLog } from '@/@types/phone';

interface CallLogItemProps {
  callLog: CallLog;
  formatTimestamp: (timestamp: string) => string;
  formatDuration: (seconds: number) => string;
}

export const CallLogItem = ({ callLog, formatTimestamp, formatDuration }: CallLogItemProps) => {
  const Icon =
    callLog.status === 'missed'
      ? PhoneMissed
      : callLog.direction === 'inbound'
        ? PhoneIncoming
        : PhoneOutgoing;
  
  const iconColor =
    callLog.status === 'missed'
      ? 'text-red-500'
      : callLog.direction === 'inbound'
        ? 'text-blue-500'
        : 'text-green-500';

  return (
    <div className="flex items-center justify-between gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-foreground truncate">
            {callLog.contact_name}
          </p>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {callLog.phone_number}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(callLog.created_at)}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <Badge
          variant={callLog.status === 'completed' ? 'default' : 'destructive'}
          className={cn(
            'text-xs',
            callLog.status === 'completed' &&
              'bg-green-100 text-green-700 hover:bg-green-100',
          )}
        >
          {callLog.status}
        </Badge>
        {callLog.duration > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatDuration(callLog.duration)}
          </p>
        )}
      </div>
    </div>
  );
};

export default CallLogItem;
