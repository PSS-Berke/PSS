"use client";

import React from 'react';
import { SidebarContent } from './sidebar-layout';
import navigationItems from '@/lib/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/xano/auth-context';
import { usePathname } from 'next/navigation';

export default function PermanentSidebar() {
  const { user, logout, switchCompany } = useAuth();

  const handleSwitchCompany = async (companyId: number) => {
    try {
      await switchCompany(companyId);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  const sidebarTop = (
    <Link
      href="/dashboard"
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/70"
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
      <span className="flex flex-col">
        <span className="text-sm font-semibold leading-tight text-foreground">
          Parallel Strategies
        </span>
        <span className="text-xs text-muted-foreground">Control Center</span>
      </span>
    </Link>
  );

  return (
    <div className="flex w-[260px] flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen">
      <SidebarContent
        items={navigationItems}
        basePath=""
        user={user}
        onLogout={logout}
        onSwitchCompany={handleSwitchCompany}
        sidebarTop={sidebarTop}
      />
    </div>
  );
}

export function ConditionalSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  // Pages that should not show sidebar
  const isAuthPage = pathname?.startsWith('/auth/');
  const isRootPage = pathname === '/';
  const shouldHideSidebar = isAuthPage || isRootPage;

  // Don't show sidebar on auth pages, root page, or when not authenticated
  if (shouldHideSidebar || (!isLoading && !user)) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="w-full flex">
      <PermanentSidebar />
      <div className="flex flex-col flex-grow w-0 ml-[260px]">
        {children}
      </div>
    </div>
  );
}
