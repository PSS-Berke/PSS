'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal, UserCircle2, Moon, Sun, LogOut, Mail, Plus, Building2, Check, Search } from 'lucide-react';
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
  onSwitchCompany?: (companyId: number) => void;
}

export function BottomNav({
  items,
  basePath,
  className,
  user,
  onLogout,
  onContactSupport,
  onManageModules,
  onSwitchCompany,
}: BottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Take first 3 items for bottom nav, rest go to More menu
  const visibleItems = items.slice(0, 3);
  const moreItems = items.slice(3);

  // Handle company switching
  const handleCompanySwitch = async (companyId: number) => {
    if (!onSwitchCompany || isSwitching) return;

    setIsSwitching(true);
    try {
      await onSwitchCompany(companyId);
      setIsCompanySelectorOpen(false);
      setCompanySearch('');
    } catch (error) {
      console.error('Failed to switch company:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Filter companies based on search
  const filteredCompanies = user?.available_companies?.filter((company) =>
    company.company_name.toLowerCase().includes(companySearch.toLowerCase())
  ) || [];

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

                {/* Company Switcher - Only show if user has multiple companies */}
                {user.available_companies && user.available_companies.length > 1 && onSwitchCompany && (
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      setIsCompanySelectorOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors min-h-[48px] text-left"
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Switch Company</span>
                  </button>
                )}

                {/* Manage Modules */}
                {onManageModules && (
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
                )}

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

      {/* Company Selector Sheet */}
      <Sheet open={isCompanySelectorOpen} onOpenChange={setIsCompanySelectorOpen}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[85vh] rounded-t-2xl pb-safe supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]"
        >
          <SheetHeader className="pb-4">
            <SheetTitle>Switch Company</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                placeholder="Search company..."
                className="w-full h-11 pl-10 pr-4 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Company List */}
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No company found.
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const isCurrentCompany = user?.company_id === company.company_id;

                  return (
                    <button
                      key={company.company_id}
                      onClick={() => handleCompanySwitch(company.company_id)}
                      disabled={isSwitching || isCurrentCompany}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-colors min-h-[48px] text-left',
                        isCurrentCompany
                          ? 'bg-accent text-foreground'
                          : 'hover:bg-muted',
                        isSwitching && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className="text-sm font-medium truncate">
                        {company.company_name}
                      </span>
                      {isCurrentCompany && (
                        <Check className="h-5 w-5 shrink-0 text-foreground" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {isSwitching && (
              <div className="text-center py-2">
                <span className="text-sm text-muted-foreground">Switching company...</span>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
