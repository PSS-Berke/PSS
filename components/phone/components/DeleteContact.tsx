'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { apiDeleteContact } from '@/lib/services/PhoneService';
import { AxiosError } from 'axios';
import { Contact } from '@/@types/phone';

interface DeleteContactProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteContact = ({ isOpen, contact, onClose, onSuccess }: DeleteContactProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDeleteContact = async () => {
    if (!contact?.id) return;

    setIsDeleting(true);
    setError('');

    try {
      await apiDeleteContact(contact.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete contact:', (error as AxiosError).message);
      setError('Failed to delete contact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>Delete Contact</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground mb-1">
                Are you sure you want to delete this contact?
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>{contact?.name}</strong> will be permanently removed from your contacts.
              </p>
              {contact?.phone_number && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {contact.phone_number}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteContact}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteContact;
