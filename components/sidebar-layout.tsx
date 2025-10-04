"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/xano/auth-context";
import { LogOut, LucideIcon, Menu, Moon, Plus, Sun, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useState } from "react";
import type { User } from "@/lib/xano/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { AddModule } from "./add-module";

function useSegment(basePath: string) {
  const path = usePathname();
  const result = path.slice(basePath.length, path.length);
  return result ? result : "/";
}

type Item = {
  name: React.ReactNode;
  href: string;
  icon: LucideIcon;
  type: "item";
};

type Sep = {
  type: "separator";
};

type Label = {
  name: React.ReactNode;
  type: "label";
};

export type SidebarItem = Item | Sep | Label;

function NavItem(props: {
  item: Item;
  onClick?: () => void;
  basePath: string;
}) {
  const segment = useSegment(props.basePath);
  const selected = segment === props.item.href;

  return (
    <Link
      href={props.basePath + props.item.href}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-muted text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      onClick={props.onClick}
      prefetch={true}
      aria-current={selected ? "page" : undefined}
    >
      <props.item.icon
        className={cn(
          "h-5 w-5 transition-colors",
          selected
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {props.item.name}
    </Link>
  );
}

export function SidebarContent(props: {
  onNavigate?: () => void;
  items: SidebarItem[];
  sidebarTop?: React.ReactNode;
  basePath: string;
  onAddModule?: () => void;
  user?: User | null;
}) {
  const segment = useSegment(props.basePath);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center border-b border-border px-4 py-4">
        {props.sidebarTop}
      </div>
      <div className="flex flex-grow flex-col gap-2 overflow-y-auto px-3 py-4">
        {props.onAddModule ? (
          <div className="pb-2">
            <button
              type="button"
              className="group flex w-full items-center justify-between px-2 text-sm font-medium text-[#C33527] transition-colors hover:text-[#DA857C]"
              onClick={() => {
                props.onAddModule?.();
                props.onNavigate?.();
              }}
            >
              <span className="text-left">Add Module</span>
              <Plus className="h-4 w-4 text-[#C33527] transition-colors group-hover:text-[#DA857C]" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {props.items.map((item, index) => {
          if (item.type === "separator") {
            return <Separator key={index} className="my-3" />;
          } else if (item.type === "item") {
            return (
              <div key={index} className="flex">
                <NavItem
                  item={item}
                  onClick={props.onNavigate}
                  basePath={props.basePath}
                />
              </div>
            );
          } else {
            return (
              <div key={index} className="px-1 py-2">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {item.name}
                </div>
              </div>
            );
          }
        })}

        <div className="flex-grow" />
      </div>

      {/* Theme toggle at the bottom of the sidebar */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Theme</div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme('dark')}
              className="dark:hidden"
              aria-label="Switch to dark"
            >
              <Moon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme('light')}
              className="hidden dark:flex"
              aria-label="Switch to light"
            >
              <Sun className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {props.user ? (
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {props.user.company ?? "Company"}
              </span>
              <span className="text-sm font-medium text-foreground">
                {props.user.email}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type HeaderBreadcrumbItem = { title: string; href: string };

function HeaderBreadcrumb(props: { items: SidebarItem[], baseBreadcrumb?: HeaderBreadcrumbItem[], basePath: string }) {
  const segment = useSegment(props.basePath);
  console.log(segment)
  const item = props.items.find((item) => item.type === 'item' && item.href === segment);
  const title: string | undefined = (item as any)?.name

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {props.baseBreadcrumb?.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function SidebarLayout(props: {
  children?: React.ReactNode;
  baseBreadcrumb?: HeaderBreadcrumbItem[];
  items: SidebarItem[];
  sidebarTop?: React.ReactNode;
  basePath: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);

  const defaultSidebarTop = (
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

  const sidebarTop = props.sidebarTop ?? defaultSidebarTop;

  return (
    <div className="w-full flex">
      <div className="flex w-[260px] flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen">
        <SidebarContent
          items={props.items}
          sidebarTop={sidebarTop}
          basePath={props.basePath}
          onAddModule={user ? () => setIsAddModuleOpen(true) : undefined}
          user={user}
        />
      </div>
      <div className="flex flex-col flex-grow w-0 ml-[260px]">
        <div className="h-14 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10 px-4 md:px-6">
          <div className="hidden md:flex">
            <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
          </div>

          <div className="flex md:hidden items-center">
            <Sheet
              onOpenChange={(open) => setSidebarOpen(open)}
              open={sidebarOpen}
            >
              <SheetTrigger>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] border-r border-border bg-background p-0">
                <SidebarContent
                  onNavigate={() => setSidebarOpen(false)}
                  items={props.items}
                  sidebarTop={sidebarTop}
                  basePath={props.basePath}
                  onAddModule={user ? () => setIsAddModuleOpen(true) : undefined}
                  user={user}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-4 flex md:hidden">
              <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle is useful even when no user is signed in - show it always */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="relative h-9 w-9 rounded-full"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Show logout only when user is present */}
            {user ? (
              <Button
                onClick={() => logout()}
                variant="ghost"
                className="gap-2 px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex-grow">{props.children}</div>
      </div>
      {user ? (
        <AddModule open={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)} />
      ) : null}
    </div>
  );
}
