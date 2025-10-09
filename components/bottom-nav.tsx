'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal, UserCircle2, Moon, Sun, LogOut, Mail, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/lib/xano/types';
import { useTheme } from 'next-themes';

export type BottomNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

interface BottomNavProps {
  items: BottomNavItem[];
  basePath: string;
  className?: string;
  user?: User | null;
  onLogout?: () => void;
  onContactSupport?: () => void;
  onManageModules?: () => void;
}

export function BottomNav({
  items,
  basePath,
  className,
  user,
  onLogout,
  onContactSupport,
  onManageModules,
}: BottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Take first 3 items for bottom nav, rest go to More menu
  const visibleItems = items.slice(0, 3);
  const moreItems = items.slice(3);

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden',
          'pb-safe supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]',
          className
        )}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {visibleItems.map((item) => {
            const fullHref = basePath + item.href;
            const isActive = pathname === fullHref || (item.href !== '/' && pathname.startsWith(fullHref));

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-2 rounded-lg transition-colors active:scale-95',
                  'min-h-[44px]', // Touch-friendly tap target
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-[#C33527]' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium truncate w-full text-center',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-2 px-2 rounded-lg transition-colors active:scale-95',
              'min-h-[44px] text-muted-foreground hover:text-foreground'
            )}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[85vh] rounded-t-2xl pb-safe supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="pb-4">
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* User Profile Section */}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <UserCircle2 className="h-7 w-7 text-muted-foreground" />
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {user.company ?? "Company"}
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Separator />
              </div>
            )}

            {/* Additional Navigation Items */}
            {moreItems.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3 pb-2">
                  Navigation
                </p>
                {moreItems.map((item) => {
                  const fullHref = basePath + item.href;
                  const isActive = pathname === fullHref || (item.href !== '/' && pathname.startsWith(fullHref));

                  return (
                    <Link
                      key={item.href}
                      href={fullHref}
                      onClick={() => setIsMoreOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors min-h-[48px]',
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                <Separator className="my-4" />
              </div>
            )}

            {/* Quick Actions */}
            {onManageModules && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3 pb-2">
                  Quick Actions
                </p>
                <button
                  onClick={() => {
                    onManageModules();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors min-h-[48px] text-left"
                >
                  <Plus className="h-5 w-5 text-[#C33527]" />
                  <span className="text-sm font-medium text-[#C33527]">Manage Modules</span>
                </button>
                <Separator className="my-4" />
              </div>
            )}

            {/* Settings & Actions */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3 pb-2">
                Settings
              </p>

              <button
                onClick={() => {
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors min-h-[48px] text-left"
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span className="text-sm font-medium">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </>
                )}
              </button>

              {onContactSupport && (
                <button
                  onClick={() => {
                    onContactSupport();
                    setIsMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors min-h-[48px] text-left"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">Contact Support</span>
                </button>
              )}

              {onLogout && (
                <>
                  <Separator className="my-2" />
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMoreOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/10 transition-colors min-h-[48px] text-left text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
