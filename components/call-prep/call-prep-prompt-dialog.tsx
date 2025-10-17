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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';
import { KeyDecisionMakersModal } from './key-decision-makers-modal';

interface CallPrepPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onOpenEnrichment?: () => void;
}

export function CallPrepPromptDialog({
  open,
  onOpenChange,
  isSubmitting,
}: CallPrepPromptDialogProps) {
  const { generateCallPrep, enrichPersonData, state, clearJustCompleted } = useCallPrep();
  const [prompt, setPrompt] = useState('');
  const [showDecisionMakersModal, setShowDecisionMakersModal] = useState(false);
  const [currentCallPrepId, setCurrentCallPrepId] = useState<number | null>(null);
  const [decisionMakers, setDecisionMakers] = useState<any[]>([]);

  // Watch for generation completion
  useEffect(() => {
    if (state.justCompleted && !isSubmitting) {
      // Check if there are decision makers to enrich
      if (
        state.justCompleted.keyDecisionMakersWithEnrichment &&
        state.justCompleted.keyDecisionMakersWithEnrichment.length > 0
      ) {
        setCurrentCallPrepId(state.justCompleted.id);
        // Convert to KeyDecisionMaker format for the modal
        const kdms = state.justCompleted.keyDecisionMakersWithEnrichment.map((kdm) => ({
          name: kdm.name,
          title: kdm.title,
          linkedin_url: kdm.linkedin_url || '',
          email: kdm.email || '',
          kdm_id: kdm.kdm_id,
        }));
        setDecisionMakers(kdms);
      }

      // Clear the justCompleted state
      clearJustCompleted();
    }
  }, [state.justCompleted, isSubmitting, clearJustCompleted]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    // Close the modal immediately
    onOpenChange(false);
    setPrompt('');

    // Call the generate API in the background
    await generateCallPrep(prompt);
  };

  const handleEnrich = async (person: any) => {
    if (!state.justCompleted) return { status: 500 };

    // Extract company name from the prompt or use a default
    const company = state.justCompleted.prompt || '';

    return await enrichPersonData(person, company);
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
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
      {showDecisionMakersModal && decisionMakers.length > 0 && state.justCompleted && (
        <KeyDecisionMakersModal
          open={showDecisionMakersModal}
          onOpenChange={handleDecisionMakersModalClose}
          decisionMakers={decisionMakers}
          companyName={state.justCompleted.prompt || ''}
          onEnrich={handleEnrich}
          isSubmitting={state.isSubmitting}
        />
      )}
    </>
  );
}
