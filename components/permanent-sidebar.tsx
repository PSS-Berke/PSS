"use client";

import React, { useState, useMemo } from 'react';
import { SidebarContent } from './sidebar-layout';
import navigationItems, { adminNavigationItems } from '@/lib/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/xano/auth-context';
import { usePathname } from 'next/navigation';
import { ModuleManager } from './module-manager';
import { useSidebar } from '@/lib/contexts/sidebar-context';
import { cn } from '@/lib/utils';

export default function PermanentSidebar() {
  const { user, logout, switchCompany, token } = useAuth();
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
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

  return (
    <>
      <div
        className="flex flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out"
        style={{ width: `${sidebarWidth}px` }}
      >
        <SidebarContent
          items={allNavigationItems}
          basePath=""
          user={user}
          onLogout={logout}
          onSwitchCompany={handleSwitchCompany}
          onAddModule={user ? () => setIsAddModuleOpen(true) : undefined}
          sidebarTop={sidebarTop}
          isCollapsed={isCollapsed}
          token={token}
        />
      </div>
      {user ? (
        <ModuleManager open={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)} />
      ) : null}
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
    <div className="w-full flex">
      <PermanentSidebar />
      <div
        className="flex flex-col flex-grow w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {children}
      </div>
    </div>
  );
}

export function ConditionalSidebar({ children }: { children: React.ReactNode }) {
  return <ConditionalSidebarInner>{children}</ConditionalSidebarInner>;
}
