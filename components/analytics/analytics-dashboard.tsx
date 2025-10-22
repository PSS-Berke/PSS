'use client';

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { AnalyticsCategoryData, AnalyticsCard } from '@/lib/xano/types';
import { cn } from '@/lib/utils';
import { CardDetailModal } from './card-detail-modal';

interface AnalyticsDashboardProps {
  categoryData: AnalyticsCategoryData | null;
  className?: string;
}

// Helper function to get icon component
function getIconComponent(iconName: string) {
  type IconMap = Record<string, typeof LucideIcons.HelpCircle>;
  const Icon = (LucideIcons as unknown as IconMap)[iconName];
  return Icon || LucideIcons.HelpCircle;
}

export function AnalyticsDashboard({ categoryData, className }: AnalyticsDashboardProps) {
  const [selectedCard, setSelectedCard] = useState<AnalyticsCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (card: AnalyticsCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCard(null), 150);
  };

  if (!categoryData) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <LucideIcons.BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Select a platform and category to view analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('flex flex-col', className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">{categoryData.name}</h1>
            {categoryData.category && (
              <span className="rounded-full bg-[#C33527] px-3 py-1 text-sm font-semibold text-white">
                {categoryData.category}
              </span>
            )}
          </div>
          <p className="mt-2 text-lg text-gray-600">{categoryData.description}</p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {categoryData.cards.map((card) => {
            const IconComponent = getIconComponent(card.icon);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={cn(
                  'group rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:shadow-lg',
                  'border-t-transparent border-t-[3px] hover:border-t-[#C33527]',
                )}
              >
                <div className="flex items-start gap-4">
                  <IconComponent className="h-8 w-8 text-[#C33527]" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 transition-colors group-hover:text-[#C33527]">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600">{card.summary}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {categoryData.cards.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <LucideIcons.Inbox className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              No analytics cards available for this category
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <CardDetailModal card={selectedCard} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
