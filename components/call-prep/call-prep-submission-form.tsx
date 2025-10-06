'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AutoResizeInput } from '@/components/ui/auto-resize-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useCallPrep } from '@/lib/xano/call-prep-context';

export function CallPrepSubmissionForm() {
  const [company, setCompany] = useState('');
  const [product, setProduct] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const { state, submitCompanyData } = useCallPrep();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim() || !product.trim()) {
      setSubmitMessage('Please fill in both company and product fields');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }

    await submitCompanyData(company, product, contact, notes);

    setSubmitMessage('Submitted! Analysis will appear below shortly.');
    setTimeout(() => setSubmitMessage(''), 3000);

    setCompany('');
    setProduct('');
    setContact('');
    setNotes('');
  };

  return (
    <div className="rounded-xl border border-border/80 bg-background/80 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="company">Company Name</Label>
            <AutoResizeInput
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name"
              disabled={state.isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product">Product or Service</Label>
            <AutoResizeInput
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Enter product or service"
              disabled={state.isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Person (Optional)</Label>
            <AutoResizeInput
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Who you'll be talking to"
              disabled={state.isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional context or information..."
            disabled={state.isSubmitting}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={state.isSubmitting}
              className="bg-[#C33527] hover:bg-[#DA857C]"
            >
              {state.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>
          {submitMessage && (
            <p className="text-sm text-muted-foreground">{submitMessage}</p>
          )}
        </div>
      </form>
    </div>
  );
}
