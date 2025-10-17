'use client';

import React from 'react';
import { PlusCircle, X, Zap, BarChart4 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/xano/auth-context';
import { getAuthHeaders } from '@/lib/xano/config';

type ModuleOption = {
  label: string;
  value: number;
};

type AddModuleProps = {
  open: boolean;
  onClose: () => void;
};

export function AddModule({ open, onClose }: AddModuleProps) {
  const { token, refreshUser, isLoading } = useAuth();
  const [moduleOptions, setModuleOptions] = React.useState<ModuleOption[]>([]);
  const [selectedModuleId, setSelectedModuleId] = React.useState<number | ''>('');
  const [isFetching, setIsFetching] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedModuleId('');
      setError(null);
      setSuccessMessage(null);
      return;
    }

    // Wait for auth to complete before fetching modules
    if (isLoading) {
      return;
    }

    if (!token) {
      setError('You must be signed in to load modules.');
      return;
    }

    let isMounted = true;

    const fetchModules = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const response = await fetch(
          'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_list_of_modules',
          {
            method: 'GET',
            headers: getAuthHeaders(token),
          },
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to fetch modules.');
        }

        const data: ModuleOption[] = await response.json();

        if (isMounted) {
          setModuleOptions(data);
          setSelectedModuleId(data[0]?.value ?? '');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Something went wrong loading modules.');
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    void fetchModules();

    return () => {
      isMounted = false;
    };
  }, [open, token, isLoading]);

  const handleCancel = () => {
    onClose();
  };

  const saveModule = async (moduleId: number) => {
    if (!token) {
      setError('Missing authentication token.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/save_module_selection',
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ module_id: moduleId }),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to save module selection.');
      }

      setSuccessMessage('Module added successfully.');
      await refreshUser();
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const isReady = moduleOptions.length > 0 && !isFetching;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogClose asChild>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md border border-transparent p-1 text-muted-foreground transition hover:bg-muted/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#C33527]" />
            Add Module
          </DialogTitle>
          <DialogDescription>
            Choose a module from the list below to add it to your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              {successMessage}
            </p>
          ) : null}

          {/* Module option cards (reference-style) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isFetching ? (
              <div className="col-span-full text-sm text-muted-foreground">Loading modules…</div>
            ) : moduleOptions.length === 0 ? (
              <div className="col-span-full text-sm text-muted-foreground">
                No modules available
              </div>
            ) : (
              moduleOptions.map((option) => {
                const label = option.label ?? String(option.value);

                const Icon = (() => {
                  const l = label.toLowerCase();
                  if (l.includes('automatio')) return <Zap className="h-6 w-6 text-[#C33527]" />; // Automations
                  if (l.includes('analytic'))
                    return <BarChart4 className="h-6 w-6 text-muted-foreground" />; // Analytics
                  return <PlusCircle className="h-6 w-6 text-muted-foreground" />; // default
                })();

                const description = (() => {
                  const l = label.toLowerCase();
                  if (l.includes('automatio')) return 'Set up automated workflows';
                  if (l.includes('analytic')) return 'View insights and metrics';
                  return 'Add this module to your workspace';
                })();

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => void saveModule(option.value)}
                    className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    disabled={isSaving}
                    aria-label={`Add ${label}`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      {Icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
                          {label}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {isSaving ? 'Saving…' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
