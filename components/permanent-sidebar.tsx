"use client";

import React, { useState, useMemo } from 'react';
import { SidebarContent } from './sidebar-layout';
import navigationItems, { adminNavigationItems } from '@/lib/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/xano/auth-context';
import { usePathname } from 'next/navigation';
import { ModuleManager } from './module-manager';
import { ModuleHubDialog } from './module-hub/module-hub-dialog';
import { useSidebar } from '@/lib/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { BottomNav, type BottomNavItem } from './bottom-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getAuthHeaders } from '@/lib/xano/config';

export default function PermanentSidebar() {
  const { user, logout, switchCompany, token } = useAuth();
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isModuleHubOpen, setIsModuleHubOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Combine navigation items with admin items if user is admin
  const allNavigationItems = useMemo(() => {
    const isAdmin = user?.role === true || user?.admin === true;
    console.log('Admin check:', { user, isAdmin, role: user?.role, admin: user?.admin });
    if (isAdmin) {
      return [...navigationItems, ...adminNavigationItems];
    }
    return navigationItems;
  }, [user]);

  const handleSwitchCompany = async (companyId: number) => {
    try {
      await switchCompany(companyId);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  const sidebarTop = (
    <button
      onClick={toggleSidebar}
      className={cn(
        "flex w-full items-center rounded-md px-2 py-2 transition-colors hover:bg-muted/70",
        isCollapsed ? "justify-center gap-0" : "gap-3"
      )}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
        <Image
          src="/White%20logo.png"
          alt="Parallel Strategies logo"
          width={40}
          height={40}
          className="h-8 w-8 object-contain"
          priority
        />
      </span>
      {!isCollapsed && (
        <span className="flex flex-col">
          <span className="text-sm font-semibold leading-tight text-foreground">
            Parallel Strategies
          </span>
          <span className="text-xs text-muted-foreground">Control Center</span>
        </span>
      )}
    </button>
  );

  const sidebarWidth = isCollapsed ? 80 : 260;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!token) {
        setSubmitError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:l7I1EMBg/send_mail_to_support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
        }),
      });

      if (response.ok) {
        setContactForm({ name: '', email: '', message: '' });
        setIsContactFormOpen(false);
        setSubmitError('');
      } else {
        setSubmitError('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert navigation items to bottom nav format
  const bottomNavItems: BottomNavItem[] = allNavigationItems
    .filter((item): item is { name: React.ReactNode; href: string; icon: any; type: 'item' } => item.type === 'item')
    .map((item) => ({
      name: String(item.name),
      href: item.href,
      icon: item.icon,
    }));

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className="hidden md:flex flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-40"
        style={{ width: `${sidebarWidth}px` }}
      >
        <SidebarContent
          items={allNavigationItems}
          basePath=""
          user={user}
          onLogout={logout}
          onSwitchCompany={handleSwitchCompany}
          onAddModule={user ? () => setIsModuleHubOpen(true) : undefined}
          sidebarTop={sidebarTop}
          isCollapsed={isCollapsed}
          token={token}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        items={bottomNavItems}
        basePath=""
        user={user}
        onLogout={logout}
        onContactSupport={() => setIsContactFormOpen(true)}
        onManageModules={user ? () => setIsModuleHubOpen(true) : undefined}
      />

      {user ? (
        <>
          <ModuleManager open={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)} />
          <ModuleHubDialog open={isModuleHubOpen} onClose={() => setIsModuleHubOpen(false)} />
        </>
      ) : null}

      {/* Contact Support Dialog */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Send us a message and we&apos;ll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            {submitError && (
              <div className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {submitError}
              </div>
            )}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsContactFormOpen(false);
                  setContactForm({ name: '', email: '', message: '' });
                  setSubmitError('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConditionalSidebarInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { isCollapsed } = useSidebar();

  // Pages that should not show sidebar
  const isAuthPage = pathname?.startsWith('/auth/');
  const isRootPage = pathname === '/';
  const shouldHideSidebar = isAuthPage || isRootPage;

  const sidebarWidth = isCollapsed ? 80 : 260;

  // Don't show sidebar on auth pages, root page, or when not authenticated
  if (shouldHideSidebar || (!isLoading && !user)) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="w-full flex flex-col md:flex-row">
      <PermanentSidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-sm border-b border-border z-30 flex items-center justify-start px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
            <Image
              src="/White%20logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="h-6 w-6 object-contain"
              priority
            />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Parallel Strategies
          </span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col flex-grow transition-all duration-300 ease-in-out",
          "w-full md:w-0", // Mobile: full width, Desktop: w-0 with flex-grow
          "pt-14 pb-20 md:pt-0 md:pb-0", // Mobile: add padding for header and bottom nav
          "ml-0 md:ml-[80px]", // Desktop: margin for collapsed sidebar
          !isCollapsed && "md:ml-[260px]" // Desktop: margin for expanded sidebar
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ConditionalSidebar({ children }: { children: React.ReactNode }) {
  return <ConditionalSidebarInner>{children}</ConditionalSidebarInner>;
}
