import { Contact } from '@/@types/phone';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  makeCall: (phone: string) => void;
}
export const ContactCard = ({ contact, makeCall }: ContactCardProps) => {
  return (
    <div
      key={contact.id}
      className="flex flex-col gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-base flex-shrink-0">
          {contact.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-foreground truncate">{contact.name}</p>
          <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
          <p className="text-xs text-foreground font-mono truncate">{contact.phone_number}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => makeCall(contact.phone_number)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" />
          Call
        </Button>
        <Button
          onClick={() => makeCall(contact.phone_number)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
      </div>
    </div>
  );
};
