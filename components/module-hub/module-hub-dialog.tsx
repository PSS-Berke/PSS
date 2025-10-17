'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Settings2 } from 'lucide-react';
import { ModuleHubTiles } from './module-hub-tiles';
import { AddModuleView } from './add-module-view';
import { ActiveModulesView } from './active-modules-view';

type ViewType = 'tiles' | 'add-module' | 'active-modules';

interface ModuleHubDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ModuleHubDialog({ open, onClose }: ModuleHubDialogProps) {
  const [view, setView] = useState<ViewType>('tiles');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset to tiles view when dialog closes
  useEffect(() => {
    if (!open) {
      setView('tiles');
    }
  }, [open]);

  const handleSelectTile = (tile: 'add-module' | 'active-modules') => {
    setView(tile);
  };

  const handleBack = () => {
    setView('tiles');
  };

  const getTitle = () => {
    switch (view) {
      case 'add-module':
        return 'Add Module';
      case 'active-modules':
        return 'Active Modules';
      default:
        return 'Module Hub';
    }
  };

  const isExpanded = view !== 'tiles';

  if (!open || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`fixed z-[10000] overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'inset-2 sm:inset-4 md:inset-8'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[600px] h-auto max-h-[90vh] sm:w-[600px] sm:h-[400px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full flex flex-col">
          {/* Header */}
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{getTitle()}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded && (
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {view === 'tiles' && <ModuleHubTiles onSelectTile={handleSelectTile} />}
            {view === 'add-module' && <AddModuleView />}
            {view === 'active-modules' && <ActiveModulesView />}
          </div>
        </Card>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
