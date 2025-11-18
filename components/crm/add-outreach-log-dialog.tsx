'use client';

import React, { useState } from 'react';
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
import { CrmContact } from '@/@types/crm';
import { useCrm } from '@/lib/xano/crm-context';
import { useAuth } from '@/lib/xano/auth-context';

interface AddOutreachLogDialogProps {
  open: boolean;
  onClose: () => void;
  contacts: CrmContact[];
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

export function AddOutreachLogDialog({
  open,
  onClose,
  contacts,
  onSuccess,
}: AddOutreachLogDialogProps) {
  const { user } = useAuth();
  const { createOutreachLog } = useCrm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    crm_contacts_id: 0,
    outreach_type: 'email' as typeof OUTREACH_TYPES[number],
    direction: 'outbound' as typeof DIRECTIONS[number],
    time: new Date().toISOString().slice(0, 16), // For datetime-local input
    subject: '',
    notes: '',
    outcome: 'connected' as typeof OUTCOMES[number],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert datetime string to Unix timestamp
      const timestamp = Math.floor(new Date(formData.time).getTime() / 1000);

      await createOutreachLog({
        user_id: user?.id || 0,
        crm_contacts_id: formData.crm_contacts_id,
        outreach_type: formData.outreach_type,
        time: timestamp,
        direction: formData.direction,
        subject: formData.subject,
        notes: formData.notes,
        outcome: formData.outcome,
      });
      onSuccess();
      // Reset form
      setFormData({
        crm_contacts_id: 0,
        outreach_type: 'email',
        direction: 'outbound',
        time: new Date().toISOString().slice(0, 16),
        subject: '',
        notes: '',
        outcome: 'connected',
      });
    } catch (error) {
      console.error('Failed to create outreach log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Outreach Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact *</Label>
                <Select
                  value={formData.crm_contacts_id.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, crm_contacts_id: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.name} - {contact.company || 'No Company'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                placeholder="Brief subject of the outreach"
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
                placeholder="Additional notes or details about this outreach..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.crm_contacts_id}>
              {isSubmitting ? 'Creating...' : 'Create Log Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

