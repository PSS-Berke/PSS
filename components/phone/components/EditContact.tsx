'use client';

import React, { useEffect } from 'react';
import { Pencil, Users, Building2, Phone, Mail, Star } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  company: z.string().max(100, 'Company name must be less than 100 characters').or(z.literal('')),
  is_favorite: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EditContactProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditContact = ({ isOpen, contact, onClose, onSuccess }: EditContactProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      company: '',
      phone_number: '',
      email: '',
      is_favorite: false,
    },
  });

  // Populate form when contact prop changes
  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name || '',
        company: contact.company || '',
        phone_number: contact.phone_number || '',
        email: contact.email || '',
        is_favorite: contact.is_favorite || false,
      });
    }
  }, [contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    if (!contact?.id) return;

    try {
      await apiEditContact(contact.id, data);
      reset(); // Reset form on success
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to edit contact:', (error as AxiosError).message);
      setError('root', {
        type: 'manual',
        message: 'Failed to edit contact. Please try again.',
      });
    }
  };

  const handleClose = () => {
    reset(); // Reset form when closing
    clearErrors();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-[#C33527]" />
            </div>
            <div>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>Update contact information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="edit-contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.root.message}</p>
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
                {...register('name')}
                placeholder="John Doe"
                className={cn('pl-10', errors.name && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
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
                {...register('company')}
                placeholder="Acme Corp"
                className={cn('pl-10', errors.company && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {errors.company && (
              <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>
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
                {...register('phone_number')}
                placeholder="+1 (555) 123-4567"
                className={cn(
                  'pl-10 font-mono',
                  errors.phone_number && 'border-red-500 focus:border-red-500',
                )}
              />
            </div>
            {errors.phone_number && (
              <p className="text-sm text-red-500 mt-1">{errors.phone_number.message}</p>
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
                {...register('email')}
                placeholder="john@acme.com"
                className={cn('pl-10', errors.email && 'border-red-500 focus:border-red-500')}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Add to Favorites</p>
                <p className="text-xs text-muted-foreground">Quick access to this contact</p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_favorite')}
                className="sr-only peer"
                id="is_favorite"
              />
              <label
                htmlFor="is_favorite"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors cursor-pointer peer-checked:bg-[#C33527]"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1 peer-checked:translate-x-6" />
              </label>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-contact-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C] disabled:opacity-50"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContact;
