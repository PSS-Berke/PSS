import { Contact } from '@/@types/phone';
import { Button } from '@/components/ui/button';
import { Phone, Edit, Pencil, Delete, Trash } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  makeCall: (phone: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}
export const ContactCard = ({ contact, makeCall, onEdit, onDelete }: ContactCardProps) => {
  return (
    <div
      key={contact.id}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 p-3 md:p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-base md:text-lg flex-shrink-0">
          {contact.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm md:text-base text-foreground truncate">
            {contact.name}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.company}</p>
          <p className="text-xs md:text-sm text-foreground font-mono truncate">
            {contact.phone_number}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-2">
        <Button
          onClick={() => makeCall(contact.phone_number)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
        >
          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
          Call
        </Button>
        <Button
          onClick={() => onEdit(contact)}
          size="sm"
          variant="outline"
          className="flex-1 md:flex-none"
        >
          <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
        <Button
          onClick={() => onDelete(contact)}
          size="sm"
          variant="outline"
          className="flex-1 md:flex-none"
        >
          <Trash className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </Button>
      </div>
    </div>
  );
};
