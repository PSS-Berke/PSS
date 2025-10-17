'use client';

import React from 'react';
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';

interface CallPrepDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  icon?: LucideIcon;
}

export function CallPrepDetailDialog({
  open,
  onOpenChange,
  title,
  content,
  icon: Icon,
}: CallPrepDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[95vw] max-h-[90vh] h-full w-full flex flex-col rounded-lg bg-transparent border-none shadow-none">
          {/* Topic Title in Top-Left */}
          <div className="absolute top-4 left-4 pointer-events-auto z-10 inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-md">
            {Icon && <Icon className="h-5 w-5 text-[#C33527]" />}
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>

          {/* Initial Analysis - Below Title */}
          <div className="absolute top-16 left-4 pointer-events-auto z-10 bg-white rounded-xl shadow-lg p-4 max-w-md">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Initial Analysis</h3>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
              {content || 'No data available'}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 pointer-events-auto bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
