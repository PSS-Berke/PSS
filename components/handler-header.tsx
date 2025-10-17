'use client';

import { useAuth } from '@/lib/xano/auth-context';
import { useTheme } from 'next-themes';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Logo } from './logo';

export default function HandlerHeader() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed w-full z-50 p-4 h-14 flex items-center py-4 border-b justify-between bg-background">
        <Logo link={user ? '/dashboard' : '/'} />

        <div className="flex items-center justify-end gap-5">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-sm hover:underline"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <Button
                onClick={() => logout()}
                variant="ghost"
                className="gap-2 px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      <div className="min-h-14" /> {/* Placeholder for fixed header */}
    </>
  );
}
