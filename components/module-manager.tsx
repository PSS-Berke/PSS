'use client';

import React from 'react';
import {
  PlusCircle,
  X,
  Zap,
  BarChart4,
  Trash2,
  Loader2,
  ArrowLeft,
  GitBranch,
  Plus,
} from 'lucide-react';

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
  id: number;
  name: string;
  description?: string;
};

type UserModule = {
  id: number;
  name: string;
  description?: string;
};

type ModuleManagerProps = {
  open: boolean;
  onClose: () => void;
};

type ViewMode = 'landing' | 'active' | 'add';

export function ModuleManager({ open, onClose }: ModuleManagerProps) {
  const { user, token, refreshUser, isLoading } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('landing');
  const [allModules, setAllModules] = React.useState<ModuleOption[]>([]);
  const [userModules, setUserModules] = React.useState<UserModule[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [removingModuleId, setRemovingModuleId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Get user's current module IDs
  const userModuleIds = React.useMemo(() => userModules.map((m) => m.id), [userModules]);

  // Reset view mode when dialog closes
  React.useEffect(() => {
    if (!open) {
      setViewMode('landing');
      setError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  // Fetch user modules when viewing Active Modules
  const fetchUserModules = React.useCallback(async () => {
    console.log('fetchUserModules called');
    if (!token) {
      console.log('No token available');
      setError('You must be signed in to manage modules.');
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      console.log('Fetching user modules from API...');
      const userModulesResponse = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_my_modules',
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        },
      );

      console.log('Response status:', userModulesResponse.status);

      if (!userModulesResponse.ok) {
        const message = await userModulesResponse.text();
        console.log('Error response:', message);
        throw new Error(message || 'Failed to fetch your modules.');
      }

      const userModulesData: UserModule[] = await userModulesResponse.json();
      console.log('User modules received:', userModulesData);
      setUserModules(userModulesData);
    } catch (err) {
      console.error('Error fetching user modules:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong loading modules.');
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  // Fetch all modules when viewing Add Module
  const fetchAllModules = React.useCallback(async () => {
    console.log('fetchAllModules called');
    if (!token) {
      console.log('No token available');
      setError('You must be signed in to manage modules.');
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      // Fetch user's modules first
      console.log('Fetching user modules from API...');
      const userModulesResponse = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_my_modules',
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        },
      );

      console.log('User modules response status:', userModulesResponse.status);

      if (!userModulesResponse.ok) {
        const message = await userModulesResponse.text();
        console.log('Error response:', message);
        throw new Error(message || 'Failed to fetch your modules.');
      }

      const userModulesData: UserModule[] = await userModulesResponse.json();
      console.log('User modules received:', userModulesData);

      // Fetch all available modules
      console.log('Fetching all modules from API...');
      const allModulesResponse = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/all_modules',
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        },
      );

      console.log('All modules response status:', allModulesResponse.status);

      if (!allModulesResponse.ok) {
        const message = await allModulesResponse.text();
        console.log('Error response:', message);
        throw new Error(message || 'Failed to fetch available modules.');
      }

      const allModulesData: ModuleOption[] = await allModulesResponse.json();
      console.log('All modules received:', allModulesData);

      setUserModules(userModulesData);
      setAllModules(allModulesData);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong loading modules.');
    } finally {
      setIsFetching(false);
    }
  }, [token]);

  const handleViewActiveModules = () => {
    console.log('handleViewActiveModules called, token:', token ? 'exists' : 'missing');
    setViewMode('active');
    if (token) {
      void fetchUserModules();
    } else {
      setError('Authentication required. Please sign in.');
    }
  };

  const handleViewAddModule = () => {
    console.log('handleViewAddModule called, token:', token ? 'exists' : 'missing');
    setViewMode('add');
    if (token) {
      void fetchAllModules();
    } else {
      setError('Authentication required. Please sign in.');
    }
  };

  const handleBack = () => {
    setViewMode('landing');
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    onClose();
  };

  const addModule = async (moduleId: number) => {
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
        throw new Error(message || 'Failed to add module.');
      }

      setSuccessMessage('Module added successfully.');
      await refreshUser();

      // Refresh the module lists
      await fetchAllModules();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong while adding the module.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeModule = async (moduleId: number) => {
    if (!token) {
      setError('Missing authentication token.');
      return;
    }

    try {
      setRemovingModuleId(moduleId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/remove_module',
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ module_id: moduleId }),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to remove module.');
      }

      setSuccessMessage('Module removed successfully.');
      await refreshUser();

      // Refresh the module lists
      await fetchUserModules();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong while removing the module.',
      );
    } finally {
      setRemovingModuleId(null);
    }
  };

  const getModuleIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('automatio')) return <Zap className="h-6 w-6 text-[#C33527]" />;
    if (n.includes('analytic')) return <BarChart4 className="h-6 w-6 text-muted-foreground" />;
    return <PlusCircle className="h-6 w-6 text-muted-foreground" />;
  };

  const getModuleDescription = (module: ModuleOption | UserModule) => {
    if (module.description) return module.description;
    const n = module.name.toLowerCase();
    if (n.includes('automatio')) return 'Set up automated workflows';
    if (n.includes('analytic')) return 'View insights and metrics';
    return 'Module for your workspace';
  };

  // Debug logging
  console.log('Module Manager Debug:');
  console.log('- All modules:', allModules);
  console.log('- User modules:', userModules);
  console.log('- User module IDs:', userModuleIds);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
            {viewMode !== 'landing' && (
              <button
                onClick={handleBack}
                className="rounded-md p-1 hover:bg-muted/60 transition"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <PlusCircle className="h-5 w-5 text-[#C33527]" />
            {viewMode === 'landing' && 'Module Hub'}
            {viewMode === 'active' && 'Active Modules'}
            {viewMode === 'add' && 'Add Module'}
          </DialogTitle>
          {viewMode === 'landing' && (
            <DialogDescription>
              Manage your workspace modules. Add new modules or remove existing ones.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
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

          {/* Landing Page - Two Navigation Buttons */}
          {viewMode === 'landing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <button
                onClick={handleViewActiveModules}
                className="flex flex-col items-center gap-4 p-8 border-2 border-gray-200 rounded-2xl hover:border-[#C33527] hover:bg-red-50/30 transition-all group"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <GitBranch className="h-12 w-12 text-[#C33527]" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Active Modules</h3>
                  <p className="text-sm text-gray-600">Manage your modules</p>
                </div>
              </button>

              <button
                onClick={handleViewAddModule}
                className="flex flex-col items-center gap-4 p-8 border-2 border-gray-200 rounded-2xl hover:border-[#C33527] hover:bg-red-50/30 transition-all group"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <Plus className="h-12 w-12 text-[#C33527]" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Add Module</h3>
                  <p className="text-sm text-gray-600">Browse available modules</p>
                </div>
              </button>
            </div>
          )}

          {/* Active Modules View */}
          {viewMode === 'active' && (
            <div>
              {isFetching ? (
                <div className="text-sm text-muted-foreground">Loading modules…</div>
              ) : userModules.length === 0 ? (
                <div className="text-sm text-muted-foreground">No active modules</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {userModules.map((module) => {
                    const Icon = getModuleIcon(module.name);
                    const description = getModuleDescription(module);
                    const isRemoving = removingModuleId === module.id;

                    return (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 p-3 border-2 border-green-200 bg-green-50 rounded-xl"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                          {Icon}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{module.name}</h4>
                          <p className="text-sm text-gray-500">{description}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void removeModule(module.id)}
                          disabled={isRemoving}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Add Module View */}
          {viewMode === 'add' && (
            <div>
              {isFetching ? (
                <div className="text-sm text-muted-foreground">Loading modules…</div>
              ) : allModules.length === 0 ? (
                <div className="text-sm text-muted-foreground">No modules available</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {allModules.map((module) => {
                    const Icon = getModuleIcon(module.name);
                    const description = getModuleDescription(module);
                    const isActive = userModuleIds.includes(module.id);

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => !isActive && void addModule(module.id)}
                        className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl transition-all text-left group ${
                          isActive
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                        }`}
                        disabled={isSaving || isActive}
                        aria-label={`Add ${module.name}`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          {Icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`font-semibold ${isActive ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}
                            >
                              {module.name}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {isActive ? 'Active' : isSaving ? 'Adding…' : ''}
                            </span>
                          </div>
                          <p className={`text-sm ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                            {description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || removingModuleId !== null}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
