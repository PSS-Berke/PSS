"use client";

import React from "react";
import { Loader2, PlusCircle, X } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/xano/auth-context";
import { getAuthHeaders } from "@/lib/xano/config";

type ModuleOption = {
  label: string;
  value: number;
};

type AddModuleProps = {
  open: boolean;
  onClose: () => void;
};

export function AddModule({ open, onClose }: AddModuleProps) {
  const { token } = useAuth();
  const [moduleOptions, setModuleOptions] = React.useState<ModuleOption[]>([]);
  const [selectedModuleId, setSelectedModuleId] = React.useState<number | "">("");
  const [isFetching, setIsFetching] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedModuleId("");
      setError(null);
      setSuccessMessage(null);
      return;
    }

    if (!token) {
      setError("You must be signed in to load modules.");
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

        if (isMounted) {
          setModuleOptions(data);
          setSelectedModuleId(data[0]?.value ?? "");
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
  }, [open, token]);

  const handleCancel = () => {
    onClose();
  };

  const handleAdd = async () => {
    if (!token) {
      setError("Missing authentication token.");
      return;
    }

    if (selectedModuleId === "") {
      setError("Please choose a module to add.");
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
          body: JSON.stringify({ module_id: selectedModuleId }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save module selection.");
      }

      setSuccessMessage("Module added successfully.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while saving."
      );
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

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Module
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C33527]"
              value={selectedModuleId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedModuleId(value === "" ? "" : Number(value));
              }}
              disabled={!isReady || isSaving}
            >
              {isFetching ? (
                <option value="">Loading modules…</option>
              ) : moduleOptions.length === 0 ? (
                <option value="">No modules available</option>
              ) : (
                moduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={isSaving || isFetching || moduleOptions.length === 0}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Add
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


