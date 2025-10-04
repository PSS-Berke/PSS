"use client";

import React from 'react';
import { useAuth } from '@/lib/xano/auth-context';
import { Button } from '@/components/ui/button';

export default function Page() {
  const { user, logout } = useAuth();

  return (
    <main className="p-8">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home — Coming soon</h1>
          {user ? (
            <Button variant="ghost" onClick={() => logout()}>
              Logout
            </Button>
          ) : null}
        </div>
        <p className="mt-4 text-muted-foreground">We are building out the dashboard home. Check back soon for overview charts, quick actions, and recent activity.</p>
      </div>
    </main>
  );
}
