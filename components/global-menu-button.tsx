"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { SidebarContent } from './sidebar-layout';
import navigationItems from '@/lib/navigation';

export default function GlobalMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="default" className="rounded-full h-12 w-12 p-0">
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[260px] border-r border-border bg-background p-0">
            <SidebarContent items={navigationItems} basePath="/dashboard" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop pinned menu (small floating button) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full h-12 w-12 p-0">
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[260px] border-r border-border bg-background p-0">
            <SidebarContent items={navigationItems} basePath="/dashboard" />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
