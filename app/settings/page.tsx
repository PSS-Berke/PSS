'use client';

import React from 'react';
import { useAuth } from '@/lib/xano/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === true || (user as any)?.admin === true;

  if (authLoading) {
    return (
      <main className="w-full h-full">
        <div className="w-full p-6 space-y-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#C33527]/15 p-2">
            <Settings className="h-5 w-5 text-[#C33527]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* User Profile Section */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{user.name}</p>
              </div>
            )}
            {user.company && (
              <div>
                <Label className="text-sm text-muted-foreground">Company</Label>
                <p className="font-medium">{user.company}</p>
              </div>
            )}
            <div>
              <Label className="text-sm text-muted-foreground">Role</Label>
              <div className="mt-1">
                <Badge className={isAdmin ? 'bg-[#C33527] hover:bg-[#DA857C] text-white' : ''}>
                  {isAdmin ? 'Admin' : 'User'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional settings and preferences will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
