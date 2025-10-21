'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact } from '@/@types/phone';
import { ContactCard } from './ContactCard';

interface ContactsListProps {
  filteredContacts: Contact[] | undefined;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddContact: () => void;
  onMakeCall: (phoneNumber: string) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
}

export const ContactsList = ({
  filteredContacts,
  searchQuery,
  onSearchChange,
  onAddContact,
  onMakeCall,
  onEditContact,
  onDeleteContact,
}: ContactsListProps) => {
  const favoriteContacts = filteredContacts?.filter((c) => c.is_favorite) || [];
  const regularContacts = filteredContacts?.filter((c) => !c.is_favorite) || [];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Button onClick={onAddContact} className="bg-[#C33527] hover:bg-[#DA857C] h-10">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {favoriteContacts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
            Favorites
          </h3>
          <div className="space-y-2">
            {favoriteContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                makeCall={onMakeCall}
                onEdit={() => onEditContact(contact)}
                onDelete={() => onDeleteContact(contact)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
          All Contacts
        </h3>
        <div className="space-y-2">
          {regularContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              makeCall={onMakeCall}
              onEdit={() => onEditContact(contact)}
              onDelete={() => onDeleteContact(contact)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsList;
