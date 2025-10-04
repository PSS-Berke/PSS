"use client";

import React from 'react';
import { SidebarContent } from './sidebar-layout';
import navigationItems from '@/lib/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/xano/auth-context';

export default function PermanentSidebar() {
  const { user } = useAuth();
  const sidebarTop = (
    <Link
      href="/"
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
      <div className="flex items-center border-b border-border px-4 py-4">{sidebarTop}</div>
      <SidebarContent items={navigationItems} basePath="/dashboard" user={user} />
    </div>
  );
}
