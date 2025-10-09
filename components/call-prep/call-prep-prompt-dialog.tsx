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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { KeyDecisionMakersModal } from './key-decision-makers-modal';
import type { CallPrepAnalysis } from '@/lib/xano/call-prep-context';

interface CallPrepPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
}

export function CallPrepPromptDialog({
  open,
  onOpenChange,
  isSubmitting,
}: CallPrepPromptDialogProps) {
  const { generateCallPrep, enrichPersonData, state } = useCallPrep();
  const [prompt, setPrompt] = useState('');
  const [showDecisionMakersModal, setShowDecisionMakersModal] = useState(false);
  const [currentCallPrepId, setCurrentCallPrepId] = useState<number | null>(null);
  const [decisionMakers, setDecisionMakers] = useState<any[]>([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    // Call the generate API
    const result = await generateCallPrep(prompt);

    if (result) {
      // Check if key_decision_makers_contact exists
      if (result.key_decision_makers_contact && result.key_decision_makers_contact.length > 0) {
        // Show modal for decision makers enrichment
        setCurrentCallPrepId(result.id);
        setDecisionMakers(result.key_decision_makers_contact);
        setShowDecisionMakersModal(true);
      } else {
        // No decision makers, close the prompt dialog
        onOpenChange(false);
      }
    }

    setPrompt('');
  };

  const handleEnrich = async (
    enrichPrompt: string,
    searchType: 'name' | 'linkedin_profile' | 'email',
    company: string
  ) => {
    if (!currentCallPrepId) return;

    await enrichPersonData(enrichPrompt, currentCallPrepId, searchType, company);

    // Close both modals
    setShowDecisionMakersModal(false);
    onOpenChange(false);
    setCurrentCallPrepId(null);
    setDecisionMakers([]);
  };

  const handleDecisionMakersModalClose = (open: boolean) => {
    setShowDecisionMakersModal(open);
    if (!open) {
      // Also close the prompt dialog when decision makers modal is closed
      onOpenChange(false);
      setCurrentCallPrepId(null);
      setDecisionMakers([]);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Call Prep</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter company or prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Subway sandwich chain"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !prompt.trim()}
              className="bg-[#C33527] hover:bg-[#DA857C]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Makers Modal */}
      {showDecisionMakersModal && decisionMakers.length > 0 && (
        <KeyDecisionMakersModal
          open={showDecisionMakersModal}
          onOpenChange={handleDecisionMakersModalClose}
          decisionMakers={decisionMakers}
          onEnrich={handleEnrich}
          isSubmitting={state.isSubmitting}
        />
      )}
    </>
  );
}
