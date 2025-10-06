'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw } from 'lucide-react';
import type { BattleCard } from '@/lib/xano/types';

interface BattleCardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleCard: BattleCard | null;
  onRefresh: (competitorName: string, serviceName: string) => Promise<void>;
}

export function BattleCardSettingsDialog({
  open,
  onOpenChange,
  battleCard,
  onRefresh,
}: BattleCardSettingsDialogProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
    if (battleCard) {
      setCompetitorName(battleCard.competitor_name || '');
      setServiceName(battleCard.competitor_service || '');
    }
  }, [battleCard]);

  const handleRefresh = async () => {
    if (!competitorName.trim() || !serviceName.trim()) return;

    setIsRefreshing(true);
    try {
      await onRefresh(competitorName.trim(), serviceName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to refresh battle card:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!battleCard) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Battle Card Settings</DialogTitle>
          <DialogDescription>
            Update the competitor and service information to regenerate the battle card with fresh insights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Competitor Name *</label>
            <Input
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              placeholder="e.g., Salesforce"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Product/Service Name *</label>
            <Input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., Sales Cloud"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Clicking &ldquo;Refresh Battle Card&rdquo; will regenerate all sections with updated information based on the competitor and service you specify.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRefreshing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || !competitorName.trim() || !serviceName.trim()}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Battle Card
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
