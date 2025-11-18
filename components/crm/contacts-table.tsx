'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, Mail, Phone } from 'lucide-react';
import { CrmContact, CrmCustomer } from '@/@types/crm';
import { useCrm } from '@/lib/xano/crm-context';
import { EditContactDialog } from './edit-contact-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContactsTableProps {
  contacts: CrmContact[];
  customers: CrmCustomer[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ContactsTable({ contacts, customers, isLoading, onRefresh }: ContactsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<CrmContact | null>(null);
  const { deleteContact } = useCrm();

  const filteredContacts = contacts.filter((contact) => {
    const search = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.number.includes(search) ||
      contact.company?.toLowerCase().includes(search)
    );
  });

  const handleDelete = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact(deletingContact.id);
      onRefresh();
      setDeletingContact(null);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead':
        return 'bg-gray-500';
      case 'Qualified':
        return 'bg-blue-500';
      case 'Proposal':
        return 'bg-yellow-500';
      case 'Negotiation':
        return 'bg-orange-500';
      case 'Closed Won':
        return 'bg-green-500';
      case 'Closed Lost':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, phone, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No contacts found matching your search.' : 'No contacts yet. Add your first contact!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${contact.email}`} className="hover:text-primary">
                            {contact.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${contact.number}`} className="hover:text-primary">
                            {contact.number}
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contact.company || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStageColor(contact.stage)}>
                        {contact.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.expected_close_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingContact(contact)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Contact Dialog */}
      {editingContact && (
        <EditContactDialog
          open={!!editingContact}
          onClose={() => setEditingContact(null)}
          contact={editingContact}
          customers={customers}
          onSuccess={() => {
            onRefresh();
            setEditingContact(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingContact?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

