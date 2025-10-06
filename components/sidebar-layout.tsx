"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/xano/auth-context";
import { LogOut, LucideIcon, Menu, Moon, Plus, Sun, UserCircle2, Check, ChevronsUpDown } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/xano/types";
import { useSidebar } from "@/lib/contexts/sidebar-context";
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
import { ModuleManager } from "./module-manager";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const fullHref = props.basePath + props.item.href;
  const selected = pathname === fullHref;

  const handleClick = (e: React.MouseEvent) => {
    if (selected) {
      e.preventDefault();
      return;
    }
    props.onClick?.();
  };

  return (
    <Link
      href={fullHref}
      className={cn(
        "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        props.isCollapsed ? "justify-center gap-0" : "gap-3",
        selected
          ? "bg-muted text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      onClick={handleClick}
      prefetch={true}
      aria-current={selected ? "page" : undefined}
      title={props.isCollapsed ? String(props.item.name) : undefined}
    >
      <props.item.icon
        className={cn(
          "h-5 w-5 transition-colors",
          selected
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!props.isCollapsed && <span>{props.item.name}</span>}
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
  onLogout?: () => void;
  onSwitchCompany?: (companyId: number) => void;
  isCollapsed?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanySelectOpen, setIsCompanySelectOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center border-b border-border px-4 py-4">
        {props.sidebarTop}
      </div>
      {!props.isCollapsed && props.user?.available_companies && props.user.available_companies.length > 1 && (
        <div className="border-b border-border px-4 py-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80 mb-1.5">
            Company
          </label>
          <Popover open={isCompanySelectOpen} onOpenChange={setIsCompanySelectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isCompanySelectOpen}
                className="w-full justify-between h-9 px-2 py-1.5 text-sm font-normal"
              >
                <span className="truncate">
                  {props.user.available_companies.find(
                    (company) => company.company_id === props.user?.company_id
                  )?.company_name || "Select company..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[228px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search company..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No company found.</CommandEmpty>
                  <CommandGroup>
                    {props.user.available_companies.map((company) => (
                      <CommandItem
                        key={company.company_id}
                        value={company.company_name}
                        onSelect={() => {
                          props.onSwitchCompany?.(company.company_id);
                          setIsCompanySelectOpen(false);
                        }}
                      >
                        {company.company_name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            props.user?.company_id === company.company_id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <div className="flex flex-grow flex-col gap-2 overflow-y-auto px-3 py-4">
        {props.onAddModule ? (
          <div className="pb-2">
            <button
              type="button"
              className={cn(
                "group flex w-full items-center px-2 text-sm font-medium text-[#C33527] transition-colors hover:text-[#DA857C]",
                props.isCollapsed ? "justify-center" : "justify-between"
              )}
              onClick={() => {
                props.onAddModule?.();
                props.onNavigate?.();
              }}
              title={props.isCollapsed ? "Add Module" : undefined}
            >
              {!props.isCollapsed && <span className="text-left">Add Module</span>}
              <Plus className="h-4 w-4 text-[#C33527] transition-colors group-hover:text-[#DA857C]" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {props.items.map((item, index) => {
          if (item.type === "separator") {
            return !props.isCollapsed ? <Separator key={index} className="my-3" /> : null;
          } else if (item.type === "item") {
            return (
              <div key={index} className="flex">
                <NavItem
                  item={item}
                  onClick={props.onNavigate}
                  basePath={props.basePath}
                  isCollapsed={props.isCollapsed}
                />
              </div>
            );
          } else {
            return !props.isCollapsed ? (
              <div key={index} className="px-1 py-2">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {item.name}
                </div>
              </div>
            ) : null;
          }
        })}

        <div className="flex-grow" />
      </div>

      {props.user ? (
        <div ref={profileMenuRef} className="relative border-t border-border">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={cn(
              "w-full px-4 py-4 flex items-center hover:bg-muted/50 transition-colors",
              props.isCollapsed ? "justify-center gap-0" : "gap-3"
            )}
            title={props.isCollapsed ? props.user.email : undefined}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </span>
            {!props.isCollapsed && (
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {props.user.company ?? "Company"}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {props.user.email}
                </span>
              </div>
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-muted transition-colors"
                >
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark mode</span>
                    </>
                  )}
                </button>
                {props.onLogout && (
                  <>
                    <Separator className="my-1" />
                    <button
                      onClick={() => {
                        props.onLogout?.();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
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
  const { user, logout, switchCompany } = useAuth();
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSwitchCompany = async (companyId: number) => {
    try {
      await switchCompany(companyId);
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  const defaultSidebarTop = (
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

  const sidebarTop = props.sidebarTop ?? defaultSidebarTop;

  const sidebarWidth = isCollapsed ? 80 : 260;

  return (
    <div className="w-full flex">
      <div
        className="flex flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out"
        style={{ width: `${sidebarWidth}px` }}
      >
        <SidebarContent
          items={props.items}
          sidebarTop={sidebarTop}
          basePath={props.basePath}
          onAddModule={user ? () => setIsAddModuleOpen(true) : undefined}
          user={user}
          onLogout={logout}
          onSwitchCompany={handleSwitchCompany}
          isCollapsed={isCollapsed}
        />
      </div>
      <div
        className="flex flex-col flex-grow w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
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
                  onLogout={logout}
                  onSwitchCompany={handleSwitchCompany}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-4 flex md:hidden">
              <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
            </div>
          </div>
        </div>
        <div className="flex-grow">{props.children}</div>
      </div>
      {user ? (
        <ModuleManager open={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)} />
      ) : null}
    </div>
  );
}
