'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Check, Phone, Building2 } from 'lucide-react';
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
import { CompanyRedacted, ChangeCompanyPhonePayload } from '@/@types/company';
import { apiChangeCompanyPhoneNumber } from '@/lib/services/CompanyService';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod validation schema for company settings
const companySettingsSchema = z.object({
  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  enable_voice_mail: z.boolean(),
  block_incoming_calls: z.boolean(),
  record_all_calls: z.boolean(),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyRedacted | undefined;
  onSuccess?: () => void;
}

export const SettingsModal = ({ isOpen, onClose, company, onSuccess }: SettingsModalProps) => {
  const [copiedNumber, setCopiedNumber] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      phone_number: '',
      enable_voice_mail: false,
      block_incoming_calls: false,
      record_all_calls: false,
    },
  });

  // Watch checkbox values for controlled components
  const enableVoiceMail = watch('enable_voice_mail');
  const blockIncomingCalls = watch('block_incoming_calls');
  const recordAllCalls = watch('record_all_calls');

  // Populate form when company prop changes
  useEffect(() => {
    if (company) {
      reset({
        phone_number: company.phone_number || '',
        enable_voice_mail: company.enable_voice_mail || false,
        block_incoming_calls: company.block_incoming_calls || false,
        record_all_calls: company.record_all_calls || false,
      });
    }
  }, [company, reset]);

  const copyPhoneNumber = () => {
    if (company?.phone_number) {
      navigator.clipboard.writeText(company.phone_number);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const onSubmit = async (data: CompanySettingsFormData) => {
    if (!company?.company_id) return;

    try {
      const payload: ChangeCompanyPhonePayload = {
        company_id: company.company_id,
        phone_number: data.phone_number,
        enable_voice_mail: data.enable_voice_mail,
        block_incoming_calls: data.block_incoming_calls,
        record_all_calls: data.record_all_calls,
      };

      await apiChangeCompanyPhoneNumber(payload);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update company settings:', (error as AxiosError).message);
      setError('root', {
        type: 'manual',
        message: 'Failed to update company settings. Please try again.',
      });
    }
  };

  const handleClose = () => {
    reset();
    clearErrors();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#C33527]" />
            </div>
            <div>
              <DialogTitle>Company Phone Settings</DialogTitle>
              <DialogDescription>Configure your company phone preferences</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          id="company-settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-4"
        >
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <div>
            <Label htmlFor="company_name" className="text-sm font-medium">
              Company Name
            </Label>
            <div className="relative mt-2">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="company_name"
                type="text"
                value={company?.company_name || ''}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone_number" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  type="tel"
                  {...register('phone_number')}
                  placeholder="+1 (555) 123-4567"
                  className={cn(
                    'pl-10 font-mono',
                    errors.phone_number && 'border-red-500 focus:border-red-500',
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyPhoneNumber}
                className="flex-shrink-0"
                disabled={!company?.phone_number}
              >
                {copiedNumber ? <Check className="w-4 h-4" /> : 'Copy'}
              </Button>
            </div>
            {errors.phone_number && (
              <p className="text-sm text-red-500 mt-1">{errors.phone_number.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Enable Voicemail</p>
              <p className="text-xs text-muted-foreground">Enable voicemail for missed calls</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={enableVoiceMail}
                onChange={(e) => setValue('enable_voice_mail', e.target.checked)}
                className="sr-only peer"
                id="enable_voice_mail"
              />
              <label
                htmlFor="enable_voice_mail"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                  enableVoiceMail ? "bg-[#C33527]" : "bg-border"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  enableVoiceMail ? "translate-x-6" : "translate-x-1"
                )} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Block Incoming Calls</p>
              <p className="text-xs text-muted-foreground">
                Block all incoming calls (Do Not Disturb)
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={blockIncomingCalls}
                onChange={(e) => setValue('block_incoming_calls', e.target.checked)}
                className="sr-only peer"
                id="block_incoming_calls"
              />
              <label
                htmlFor="block_incoming_calls"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                  blockIncomingCalls ? "bg-[#C33527]" : "bg-border"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  blockIncomingCalls ? "translate-x-6" : "translate-x-1"
                )} />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium text-sm">Record All Calls</p>
              <p className="text-xs text-muted-foreground">Automatically record all calls</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={recordAllCalls}
                onChange={(e) => setValue('record_all_calls', e.target.checked)}
                className="sr-only peer"
                id="record_all_calls"
              />
              <label
                htmlFor="record_all_calls"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                  recordAllCalls ? "bg-[#C33527]" : "bg-border"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  recordAllCalls ? "translate-x-6" : "translate-x-1"
                )} />
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
            form="company-settings-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C] disabled:opacity-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
