'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialerProps {
  dialedNumber: string;
  onDigitClick: (digit: string) => void;
  onDelete: () => void;
  onCall: () => void;
  onInputChange: (value: string) => void;
}

export const Dialer = ({
  dialedNumber,
  onDigitClick,
  onDelete,
  onCall,
  onInputChange,
}: DialerProps) => {
  const dialButtons = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <input
          type="tel"
          value={dialedNumber}
          placeholder="Enter phone number"
          className="w-full text-center text-3xl font-light border-b-2 border-border focus:border-[#C33527] outline-none py-4 font-mono bg-transparent"
          onChange={(e) => onInputChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {dialButtons.map((button) => (
          <button
            key={button.digit}
            onClick={() => onDigitClick(button.digit)}
            className="h-20 flex flex-col items-center justify-center border-2 border-border rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <span className="text-3xl font-light">{button.digit}</span>
            {button.letters && (
              <span className="text-xs text-muted-foreground mt-1">{button.letters}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onDelete}
          disabled={dialedNumber.length === 0}
          className="flex-1 h-14"
        >
          Delete
        </Button>
        <Button
          onClick={onCall}
          disabled={dialedNumber.length === 0}
          className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
        >
          <Phone className="w-5 h-5 mr-2" />
          Call
        </Button>
      </div>
    </div>
  );
};

export default Dialer;
