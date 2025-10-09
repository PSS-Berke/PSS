'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Linkedin, Mail } from 'lucide-react';
import type { KeyDecisionMaker } from '@/lib/xano/call-prep-context';

interface KeyDecisionMakersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionMakers: KeyDecisionMaker[];
  onEnrich: (prompt: string, searchType: 'name' | 'linkedin_profile' | 'email', company: string) => Promise<void>;
  isSubmitting: boolean;
}

export function KeyDecisionMakersModal({
  open,
  onOpenChange,
  decisionMakers,
  onEnrich,
  isSubmitting,
}: KeyDecisionMakersModalProps) {
  const [selectedPerson, setSelectedPerson] = useState<KeyDecisionMaker | null>(null);
  const [searchType, setSearchType] = useState<'name' | 'linkedin_profile' | 'email' | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [showCompanyInput, setShowCompanyInput] = useState(false);

  const handlePersonSelect = (person: KeyDecisionMaker) => {
    setSelectedPerson(person);
    setSearchType(null);
    setShowCompanyInput(false);
    setCompanyName('');
  };

  const handleSearchTypeSelect = (type: 'name' | 'linkedin_profile' | 'email') => {
    setSearchType(type);
    // Always show company input for all search types
    setShowCompanyInput(true);
  };

  const handleEnrich = async () => {
    if (!selectedPerson || !searchType || !companyName.trim()) return;

    let prompt = '';
    if (searchType === 'name') {
      prompt = selectedPerson.name;
    } else if (searchType === 'linkedin_profile') {
      prompt = selectedPerson.linkedin_url;
    } else if (searchType === 'email') {
      prompt = selectedPerson.email || '';
    }

    await onEnrich(prompt, searchType, companyName);

    // Reset state
    setSelectedPerson(null);
    setSearchType(null);
    setShowCompanyInput(false);
    setCompanyName('');
  };

  const handleSkip = () => {
    onOpenChange(false);
    setSelectedPerson(null);
    setSearchType(null);
    setShowCompanyInput(false);
    setCompanyName('');
  };

  const canSubmit = selectedPerson && searchType && companyName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enrich Decision Maker Data</DialogTitle>
          <DialogDescription>
            Select a decision maker to search for additional information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Decision Makers List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select a person</Label>
            <div className="grid gap-2">
              {decisionMakers.map((person, index) => (
                <button
                  key={index}
                  onClick={() => handlePersonSelect(person)}
                  disabled={isSubmitting}
                  className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                    selectedPerson === person
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.title}</p>
                      {person.linkedin_url && (
                        <div className="flex items-center gap-1 mt-1">
                          <Linkedin className="h-3 w-3 text-blue-600" />
                          <p className="text-xs text-blue-600 truncate">{person.linkedin_url}</p>
                        </div>
                      )}
                      {person.email && (
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-green-600 truncate">{person.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Type Selection */}
          {selectedPerson && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">How would you like to search?</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => handleSearchTypeSelect('name')}
                  disabled={isSubmitting}
                  className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                    searchType === 'name'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Search by Name</p>
                      <p className="text-xs text-muted-foreground">Name: {selectedPerson.name}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleSearchTypeSelect('linkedin_profile')}
                  disabled={isSubmitting}
                  className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                    searchType === 'linkedin_profile'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Search by LinkedIn</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedPerson.linkedin_url || 'No URL available'}
                      </p>
                    </div>
                  </div>
                </button>
                {selectedPerson.email && (
                  <button
                    onClick={() => handleSearchTypeSelect('email')}
                    disabled={isSubmitting}
                    className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                      searchType === 'email'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Search by Email</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedPerson.email}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Company Input - Always shown when search type is selected */}
          {showCompanyInput && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="company">Company Name (required)</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Microsoft"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleEnrich}
            disabled={!canSubmit || isSubmitting}
            className="bg-[#C33527] hover:bg-[#DA857C]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              'Enrich Data'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
