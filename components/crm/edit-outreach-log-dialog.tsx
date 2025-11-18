'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CrmOutreachLog } from '@/@types/crm';
import { useCrm } from '@/lib/xano/crm-context';

interface EditOutreachLogDialogProps {
  open: boolean;
  onClose: () => void;
  log: CrmOutreachLog;
  onSuccess: () => void;
}

const OUTREACH_TYPES = ['email', 'call', 'meeting', 'linkedin'] as const;
const DIRECTIONS = ['inbound', 'outbound'] as const;
const OUTCOMES = [
  'connected',
  'no_answer',
  'left_voicemail',
  'scheduled_followup',
  'closed',
] as const;

export function EditOutreachLogDialog({
  open,
  onClose,
  log,
  onSuccess,
}: EditOutreachLogDialogProps) {
  const { updateOutreachLog } = useCrm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    outreach_type: log.outreach_type,
    direction: log.direction,
    time: new Date(log.time * 1000).toISOString().slice(0, 16),
    subject: log.subject,
    notes: log.notes,
    outcome: log.outcome,
  });

  useEffect(() => {
    setFormData({
      outreach_type: log.outreach_type,
      direction: log.direction,
      time: new Date(log.time * 1000).toISOString().slice(0, 16),
      subject: log.subject,
      notes: log.notes,
      outcome: log.outcome,
    });
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const timestamp = Math.floor(new Date(formData.time).getTime() / 1000);

      await updateOutreachLog(log.id, {
        outreach_type: formData.outreach_type,
        time: timestamp,
        direction: formData.direction,
        subject: formData.subject,
        notes: formData.notes,
        outcome: formData.outcome,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update outreach log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Outreach Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input value={log.name || 'Unknown'} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outreach_type">Outreach Type *</Label>
                <Select
                  value={formData.outreach_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      outreach_type: value as typeof OUTREACH_TYPES[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTREACH_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      direction: value as typeof DIRECTIONS[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((dir) => (
                      <SelectItem key={dir} value={dir}>
                        {dir.charAt(0).toUpperCase() + dir.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Date & Time *</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome *</Label>
              <Select
                value={formData.outcome}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, outcome: value as typeof OUTCOMES[number] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Log Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

