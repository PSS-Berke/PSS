'use client';

import { useAuth } from "@/lib/xano/auth-context";
import { useTheme } from "next-themes";
import { Logo } from "./logo";

export default function HandlerHeader() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed w-full z-50 p-4 h-14 flex items-center py-4 border-b justify-between bg-background">
        <Logo link={user ? "/dashboard" : "/"}/>

        <div className="flex items-center justify-end gap-5">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-sm hover:underline"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={() => logout()}
                className="text-sm hover:underline text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="min-h-14"/> {/* Placeholder for fixed header */}
    </>
  );
}