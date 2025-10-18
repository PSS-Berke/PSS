'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Building2, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { apiEditContact } from '@/lib/services/PhoneService';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { Contact } from '@/@types/phone';

// Zod validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  company: z.string().max(100, 'Company name must be less than 100 characters').or(z.literal('')),
  is_favorite: z.boolean().default(false),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EditContactProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditContact = ({ isOpen, contact, onClose, onSuccess }: EditContactProps) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContact, setNewContact] = useState<ContactFormData>({
    name: '',
    company: '',
    phone_number: '',
    email: '',
    is_favorite: false,
  });

  // Populate form when contact prop changes
  useEffect(() => {
    if (contact) {
      setNewContact({
        name: contact.name || '',
        company: contact.company || '',
        phone_number: contact.phone_number || '',
        email: contact.email || '',
        is_favorite: contact.is_favorite || false,
      });
    }
  }, [contact]);

  const handleNewContactChange = (key: string, value: any) => {
    setNewContact((prev) => ({ ...prev, [key]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleEditContact = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Validate form data with Zod
      const validatedData = contactSchema.parse(newContact);

      if (contact?.id) {
        await apiEditContact(contact.id, validatedData);
      }

      // Reset form on success
      setNewContact({
        name: '',
        company: '',
        phone_number: '',
        email: '',
        is_favorite: false,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        console.error('Failed to add contact:', (error as AxiosError).message);
        setFormErrors({ general: 'Failed to add contact. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setNewContact({
      name: '',
      company: '',
      phone_number: '',
      email: '',
      is_favorite: false,
    });
    setFormErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#C33527]" />
            </div>
            <div>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Enter contact information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {formErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{formErrors.general}</p>
            </div>
          )}

          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={newContact.name}
                onChange={(e) => handleNewContactChange('name', e.target.value)}
                placeholder="John Doe"
                className={cn('pl-10', formErrors.name && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <Label htmlFor="company" className="text-sm font-medium">
              Company
            </Label>
            <div className="relative mt-2">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="company"
                type="text"
                value={newContact.company}
                onChange={(e) => handleNewContactChange('company', e.target.value)}
                placeholder="Acme Corp"
                className={cn('pl-10', formErrors.company && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {formErrors.company && (
              <p className="text-sm text-red-500 mt-1">{formErrors.company}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={newContact.phone_number}
                onChange={(e) => handleNewContactChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={cn(
                  'pl-10 font-mono',
                  formErrors.phone_number && 'border-red-500 focus:border-red-500',
                )}
              />
            </div>
            {formErrors.phone_number && (
              <p className="text-sm text-red-500 mt-1">{formErrors.phone_number}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => handleNewContactChange('email', e.target.value)}
                placeholder="john@acme.com"
                className={cn('pl-10', formErrors.email && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Add to Favorites</p>
                <p className="text-xs text-muted-foreground">Quick access to this contact</p>
              </div>
            </div>
            <button
              onClick={() => handleNewContactChange('is_favorite', !newContact.is_favorite)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                newContact.is_favorite ? 'bg-[#C33527]' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  newContact.is_favorite ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleEditContact}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C] disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Editing...' : 'Edit Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContact;
