"use client";

import React from "react";
import { PlusCircle, X, Zap, BarChart4, Trash2, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/xano/auth-context";
import { getAuthHeaders } from "@/lib/xano/config";

type ModuleOption = {
  label: string;
  value: number;
};

type ModuleManagerProps = {
  open: boolean;
  onClose: () => void;
};

export function ModuleManager({ open, onClose }: ModuleManagerProps) {
  const { user, token, refreshUser, isLoading } = useAuth();
  const [allModules, setAllModules] = React.useState<ModuleOption[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [removingModuleId, setRemovingModuleId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Get user's current modules - memoized to prevent recreation on every render
  const userModules = React.useMemo(() => user?.modules || [], [user?.modules]);
  const userModuleIds = React.useMemo(() => userModules.map(m => m.id), [userModules]);

  React.useEffect(() => {
    if (!open) {
      setError(null);
      setSuccessMessage(null);
      return;
    }

    // Wait for auth to complete before fetching modules
    if (isLoading) {
      return;
    }

    if (!token) {
      setError("You must be signed in to manage modules.");
      return;
    }

    let isMounted = true;

    const fetchModules = async () => {
      try {
        setIsFetching(true);
        setError(null);

        const response = await fetch(
          "https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_list_of_modules",
          {
            method: "GET",
            headers: getAuthHeaders(token),
          }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to fetch modules.");
        }

        const data: ModuleOption[] = await response.json();

        console.log('API Response Status:', response.status);
        console.log('API modules:', data);
        console.log('User modules:', userModules);
        console.log('User module IDs:', userModuleIds);

        // If API returns empty but user has modules, create module options from user data
        let modulesToSet = data;
        if ((!data || data.length === 0) && userModules.length > 0) {
          console.log('API returned empty, creating modules from user data');
          modulesToSet = userModules.map(m => ({
            label: m.name,
            value: m.id
          }));
        }

        if (isMounted) {
          setAllModules(modulesToSet);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Something went wrong loading modules."
        );
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
  }, [open, token, userModules, userModuleIds, isLoading]);

  const handleCancel = () => {
    onClose();
  };

  const addModule = async (moduleId: number) => {
    if (!token) {
      setError("Missing authentication token.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        "https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/save_module_selection",
        {
          method: "POST",
          headers: getAuthHeaders(token),
          body: JSON.stringify({ module_id: moduleId }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to add module.");
      }

      setSuccessMessage("Module added successfully.");
      await refreshUser();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while adding the module."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeModule = async (moduleId: number) => {
    if (!token) {
      setError("Missing authentication token.");
      return;
    }

    try {
      setRemovingModuleId(moduleId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        "https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/remove_module",
        {
          method: "POST",
          headers: getAuthHeaders(token),
          body: JSON.stringify({ module_id: moduleId }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to remove module.");
      }

      setSuccessMessage("Module removed successfully.");
      await refreshUser();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while removing the module."
      );
    } finally {
      setRemovingModuleId(null);
    }
  };

  const getModuleIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("automatio")) return <Zap className="h-6 w-6 text-[#C33527]" />;
    if (l.includes("analytic")) return <BarChart4 className="h-6 w-6 text-muted-foreground" />;
    return <PlusCircle className="h-6 w-6 text-muted-foreground" />;
  };

  const getModuleDescription = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("automatio")) return "Set up automated workflows";
    if (l.includes("analytic")) return "View insights and metrics";
    return "Module for your workspace";
  };

  // Split modules into active and available
  const activeModules = allModules.filter(m => userModuleIds.includes(m.value));
  const availableModules = allModules.filter(m => !userModuleIds.includes(m.value));

  // Debug logging
  console.log('Module Manager Debug:');
  console.log('- All modules:', allModules);
  console.log('- User module IDs:', userModuleIds);
  console.log('- Active modules (filtered):', activeModules);
  console.log('- Available modules (filtered):', availableModules);

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
            <PlusCircle className="h-5 w-5 text-[#C33527]" />
            Module Manager
          </DialogTitle>
          <DialogDescription>
            Manage your workspace modules. Add new modules or remove existing ones.
          </DialogDescription>
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

          {/* Active Modules Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Active Modules</h3>
            {isFetching ? (
              <div className="text-sm text-muted-foreground">Loading modules…</div>
            ) : activeModules.length === 0 ? (
              <div className="text-sm text-muted-foreground">No active modules</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeModules.map((module) => {
                  const label = module.label ?? String(module.value);
                  const Icon = getModuleIcon(label);
                  const description = getModuleDescription(label);
                  const isRemoving = removingModuleId === module.value;

                  return (
                    <div
                      key={module.value}
                      className="flex items-center gap-3 p-3 border-2 border-green-200 bg-green-50 rounded-xl"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
                        {Icon}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{label}</h4>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void removeModule(module.value)}
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

          {/* Available Modules Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Available Modules</h3>
            {isFetching ? (
              <div className="text-sm text-muted-foreground">Loading modules…</div>
            ) : availableModules.length === 0 ? (
              <div className="text-sm text-muted-foreground">All modules are active</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availableModules.map((module) => {
                  const label = module.label ?? String(module.value);
                  const Icon = getModuleIcon(label);
                  const description = getModuleDescription(label);

                  return (
                    <button
                      key={module.value}
                      type="button"
                      onClick={() => void addModule(module.value)}
                      className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                      disabled={isSaving}
                      aria-label={`Add ${label}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        {Icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800 group-hover:text-blue-600">{label}</h4>
                          <span className="text-sm text-muted-foreground">{isSaving ? "Adding…" : ""}</span>
                        </div>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving || removingModuleId !== null}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
