'use client';

import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalyticsCard } from '@/lib/xano/types';
import { cn } from '@/lib/utils';

interface CardDetailModalProps {
  card: AnalyticsCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !card) return null;

  const handleCopyCode = async () => {
    if (card.content.type === 'code' && typeof card.content.data === 'string') {
      await navigator.clipboard.writeText(card.content.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    const { type, data } = card.content;

    if (type === 'code' && typeof data === 'string') {
      return (
        <div className="rounded-lg bg-gray-900 p-6 font-mono text-sm text-gray-100 overflow-x-auto">
          <pre className="whitespace-pre-wrap">{data}</pre>
        </div>
      );
    }

    if (type === 'table' && typeof data === 'object' && 'headers' in data) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                {data.headers.map((header, idx) => (
                  <th key={idx} className="border border-gray-300 p-3 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-gray-300 p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Text/HTML content
    if (typeof data === 'string') {
      return (
        <div
          className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-[#C33527] prose-code:text-[#C33527] prose-code:bg-red-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      );
    }

    return <p className="text-muted-foreground">No content available</p>;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg border-t-4 border-[#C33527] bg-gray-800 px-6 py-4 text-white">
          <h2 className="text-xl font-semibold">{card.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-[#C33527]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {card.content.type === 'code' && (
            <Button
              className="gap-2 bg-[#C33527] hover:bg-[#A82A1F]"
              onClick={handleCopyCode}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
