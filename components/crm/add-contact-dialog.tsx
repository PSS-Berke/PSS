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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCrm } from '@/lib/xano/crm-context';
import { useAuth } from '@/lib/xano/auth-context';
import { AddCustomerDialog } from './add-customer-dialog';
import { apiGetCrmCustomers } from '@/lib/services/CrmService';
import type { CrmCustomer } from '@/@types/crm';

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;

export function AddContactDialog({ open, onClose, onSuccess }: AddContactDialogProps) {
  const { user } = useAuth();
  const { createContact, fetchCustomers } = useCrm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    crm_customer_id: 0,
    stage: 'Lead' as typeof STAGES[number],
    expected_close_date: '',
  });

  const handleFetchCustomers = async () => {
    // Don't fetch if already loading
    if (isLoadingCustomers) {
      return;
    }
    
    setIsLoadingCustomers(true);
    try {
      const data = await apiGetCrmCustomers();
      // Handle case where API might return data wrapped in an object
      const customersList = Array.isArray(data) ? data : (data as any)?.data || [];
      setCustomers(customersList);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert date string to Unix timestamp
      const closeDate = formData.expected_close_date
        ? Math.floor(new Date(formData.expected_close_date).getTime() / 1000)
        : 0;

      await createContact({
        name: formData.name,
        email: formData.email,
        number: formData.number,
        crm_customer_id: formData.crm_customer_id,
        company_id: user?.company_id || 0,
        added_by: user?.id || 0,
        stage: formData.stage,
        expected_close_date: closeDate,
      });
      onSuccess();
      // Reset form
      setFormData({
        name: '',
        email: '',
        number: '',
        crm_customer_id: 0,
        stage: 'Lead',
        expected_close_date: '',
      });
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
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
                      value={formData.crm_customer_id > 0 ? formData.crm_customer_id.toString() : ""}
                      onValueChange={(value) => {
                        if (value && value !== "loading" && value !== "no-customers") {
                          setFormData((prev) => ({ ...prev, crm_customer_id: parseInt(value) }));
                        }
                        setIsSelectOpen(false);
                      }}
                      open={isSelectOpen}
                      onOpenChange={(open) => {
                        setIsSelectOpen(open);
                        if (open) {
                          handleFetchCustomers();
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue
                          placeholder={isLoadingCustomers ? "Loading customers..." : "Select customer"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCustomers ? (
                          <SelectItem value="loading" disabled>
                            Loading customers...
                          </SelectItem>
                        ) : customers.length === 0 ? (
                          <SelectItem value="no-customers" disabled>
                            No customers available
                          </SelectItem>
                        ) : (
                          <>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
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
                {isSubmitting ? 'Creating...' : 'Create Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={async () => {
          await fetchCustomers();
          // Refresh local customers list
          try {
            const data = await apiGetCrmCustomers();
            const customersList = Array.isArray(data) ? data : (data as any)?.data || [];
            setCustomers(customersList);
          } catch (error) {
            console.error('Failed to refresh customers:', error);
          }
          setShowAddCustomer(false);
        }}
      />
    </>
  );
}

