'use client';

import React, { useState } from 'react';
import { Settings, Check } from 'lucide-react';
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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [settings, setSettings] = useState({
    phoneNumber: '+1 (555) 900-1234',
    voicemailEnabled: true,
    voicemailGreeting: 'default',
    callForwarding: false,
    forwardNumber: '',
    doNotDisturb: false,
    callRecording: false,
    notificationSound: true,
  });

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(settings.phoneNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#C33527]" />
            </div>
            <div>
              <DialogTitle>Phone Settings</DialogTitle>
              <DialogDescription>Configure your phone preferences</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium">Your Phone Number</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={settings.phoneNumber}
                onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyPhoneNumber}
                className="flex-shrink-0"
              >
                {copiedNumber ? <Check className="w-4 h-4" /> : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Voicemail</p>
              <p className="text-xs text-muted-foreground">Enable voicemail for missed calls</p>
            </div>
            <button
              onClick={() => handleSettingChange('voicemailEnabled', !settings.voicemailEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.voicemailEnabled ? 'bg-[#C33527]' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.voicemailEnabled ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Do Not Disturb</p>
              <p className="text-xs text-muted-foreground">Block incoming calls</p>
            </div>
            <button
              onClick={() => handleSettingChange('doNotDisturb', !settings.doNotDisturb)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.doNotDisturb ? 'bg-[#C33527]' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.doNotDisturb ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Call Recording</p>
              <p className="text-xs text-muted-foreground">Record all calls automatically</p>
            </div>
            <button
              onClick={() => handleSettingChange('callRecording', !settings.callRecording)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.callRecording ? 'bg-[#C33527]' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.callRecording ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={saveSettings}
            className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C]"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
