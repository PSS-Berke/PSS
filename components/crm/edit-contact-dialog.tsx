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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { CrmContact, CrmCustomer } from '@/@types/crm';
import { useCrm } from '@/lib/xano/crm-context';
import { AddCustomerDialog } from './add-customer-dialog';

interface EditContactDialogProps {
  open: boolean;
  onClose: () => void;
  contact: CrmContact;
  customers: CrmCustomer[];
  onSuccess: () => void;
}

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;

export function EditContactDialog({
  open,
  onClose,
  contact,
  customers,
  onSuccess,
}: EditContactDialogProps) {
  const { updateContact, fetchCustomers } = useCrm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [formData, setFormData] = useState({
    name: contact.name,
    email: contact.email,
    number: contact.number,
    crm_customer_id: contact.crm_customer_id,
    stage: contact.stage,
    expected_close_date: contact.expected_close_date
      ? new Date(contact.expected_close_date * 1000).toISOString().split('T')[0]
      : '',
  });

  useEffect(() => {
    setFormData({
      name: contact.name,
      email: contact.email,
      number: contact.number,
      crm_customer_id: contact.crm_customer_id,
      stage: contact.stage,
      expected_close_date: contact.expected_close_date
        ? new Date(contact.expected_close_date * 1000).toISOString().split('T')[0]
        : '',
    });
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const closeDate = formData.expected_close_date
        ? Math.floor(new Date(formData.expected_close_date).getTime() / 1000)
        : 0;

      await updateContact(contact.id, {
        name: formData.name,
        email: formData.email,
        number: formData.number,
        crm_customer_id: formData.crm_customer_id,
        stage: formData.stage,
        expected_close_date: closeDate,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Phone Number *</Label>
                  <Input
                    id="number"
                    type="tel"
                    value={formData.number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.crm_customer_id.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, crm_customer_id: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCustomer(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage *</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, stage: value as typeof STAGES[number] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close_date">Expected Close Date</Label>
                  <Input
                    id="close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expected_close_date: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.crm_customer_id}>
                {isSubmitting ? 'Updating...' : 'Update Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddCustomerDialog
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={async () => {
          await fetchCustomers();
          setShowAddCustomer(false);
        }}
      />
    </>
  );
}

