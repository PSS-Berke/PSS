'use client';

import React from 'react';
import { PhoneOff, Mic, MicOff, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActiveCallOverlayProps {
  activeCall: {
    phone_number: string;
    contact_name: string;
    status: string;
    startTime: string;
  } | null;
  callDuration: number;
  isMuted: boolean;
  isOnHold: boolean;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onAcceptCall?: () => void;
  onRejectCall?: () => void;
  formatDuration: (seconds: number) => string;
}

export const ActiveCallOverlay = ({
  activeCall,
  callDuration,
  isMuted,
  isOnHold,
  onEndCall,
  onToggleMute,
  onToggleHold,
  onAcceptCall,
  onRejectCall,
  formatDuration,
}: ActiveCallOverlayProps) => {
  console.log('ActiveCallOverlay render:', { activeCall, callDuration });
  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-8">
          <div
            className={cn(
              'w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl md:text-5xl font-semibold',
              activeCall.status === 'ringing' ? 'bg-[#C33527] animate-pulse' : 'bg-[#C33527]',
            )}
          >
            {activeCall.contact_name ? activeCall.contact_name.charAt(0) : '?'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {activeCall.contact_name || 'Unknown'}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-mono mb-2">
            {activeCall.phone_number}
          </p>
          <p className="text-sm md:text-base text-muted-foreground capitalize">
            {activeCall.status === 'ringing' && 'Calling...'}
            {activeCall.status === 'incoming' && 'Incoming call...'}
            {activeCall.status === 'in-progress' && formatDuration(callDuration)}
          </p>
        </div>

        {/* Incoming call buttons */}
        {activeCall.status === 'incoming' && (
          <div className="flex justify-center gap-6 mb-8">
            <Button
              onClick={onRejectCall}
              size="lg"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white p-0"
            >
              <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
            <Button
              onClick={onAcceptCall}
              size="lg"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-600 hover:bg-green-700 text-white p-0"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
            </Button>
          </div>
        )}

        {activeCall.status === 'in-progress' && (
          <div className="flex justify-center gap-4 md:gap-6 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleMute}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0"
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleHold}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0"
            >
              {isOnHold ? (
                <Play className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </Button>
          </div>
        )}

        {/* End call button - only show for in-progress calls */}
        {activeCall.status === 'in-progress' && (
          <Button
            onClick={onEndCall}
            size="lg"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 mx-auto"
          >
            <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActiveCallOverlay;
