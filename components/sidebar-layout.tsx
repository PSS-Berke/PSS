"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/xano/auth-context";
import { LogOut, LucideIcon, Menu, Moon, Plus, Sun, UserCircle2, Check, ChevronsUpDown, Mail, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
// Removed cmdk Command components to avoid React 19 ref incompatibility in this view
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
  token?: string | null;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanySelectOpen, setIsCompanySelectOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideProfile = profileMenuRef.current?.contains(target);
      const clickedInsideContactForm = contactFormRef.current?.contains(target);

      if (!clickedInsideProfile && !clickedInsideContactForm) {
        setIsProfileMenuOpen(false);
        setIsContactFormOpen(false);
      }
    }

    if (isProfileMenuOpen || isContactFormOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen, isContactFormOpen]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!props.token) {
        setSubmitError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:l7I1EMBg/send_mail_to_support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${props.token}`,
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
        setIsProfileMenuOpen(false);
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

  return (
    <div className="hidden md:flex h-full flex-col bg-background">
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
              <button
                type="button"
                role="combobox"
                aria-expanded={isCompanySelectOpen}
                className="inline-flex w-full items-center justify-between h-9 px-2 py-1.5 text-sm font-normal rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="truncate">
                  {props.user?.available_companies?.find(
                    (company) => company.company_id === props.user?.company_id
                  )?.company_name || "Select company..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[228px] p-0" align="start">
              {mounted && isCompanySelectOpen ? (
                <div className="w-full">
                  <div className="flex items-center border-b px-2">
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Search company..."
                      className="h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {(
                      props.user?.available_companies?.filter((c) =>
                        ((c?.company_name ?? '').toLowerCase()).includes((companySearch ?? '').toLowerCase())
                      ) || []
                    ).length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">No company found.</div>
                    ) : (
                      <div className="p-1">
                        {(props.user?.available_companies || [])
                          .filter((c) => ((c?.company_name ?? '').toLowerCase()).includes((companySearch ?? '').toLowerCase()))
                          .map((company) => (
                            <button
                              key={company.company_id}
                              type="button"
                              onClick={() => {
                                props.onSwitchCompany?.(company.company_id);
                                setIsCompanySelectOpen(false);
                                setCompanySearch("");
                              }}
                              className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                            >
                              <span className="truncate">{company.company_name}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  props.user?.company_id === company.company_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
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
                props.isCollapsed ? "justify-center" : "justify-start"
              )}
              onClick={() => {
                props.onAddModule?.();
                props.onNavigate?.();
              }}
              title={props.isCollapsed ? "Manage Modules" : undefined}
            >
              <span className="text-left">Manage Modules</span>
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

          {isProfileMenuOpen && !isContactFormOpen && (
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
                <Separator className="my-1" />
                <button
                  onClick={() => {
                    setIsContactFormOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Support</span>
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

      {mounted && isContactFormOpen && createPortal(
        <div ref={contactFormRef} className="fixed bottom-24 left-4 w-[400px] bg-popover border border-border rounded-lg shadow-2xl overflow-hidden z-[10001]">
          <form onSubmit={handleContactSubmit} className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
            {submitError && (
              <div className="mb-4 px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {submitError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsContactFormOpen(false);
                    setContactForm({ name: '', email: '', message: '' });
                    setSubmitError('');
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}
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
  const { user, logout, switchCompany, token } = useAuth();
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

  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

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

  // Extract bottom nav items (primary navigation only)
  const bottomNavItems: BottomNavItem[] = props.items
    .filter((item): item is Item => item.type === 'item')
    .map((item) => ({
      name: String(item.name),
      href: item.href,
      icon: item.icon,
    }));

  return (
    <div className="w-full flex">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className="hidden md:flex flex-col border-r border-border bg-background/95 fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out"
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
          token={token}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col flex-grow w-0 transition-all duration-300 ease-in-out",
          "ml-0", // Mobile: no margin
          "md:ml-[80px]", // Desktop collapsed: 80px margin
          !isCollapsed && "md:ml-[260px]" // Desktop expanded: 260px margin
        )}
      >
        {/* Top Header */}
        <div className="h-14 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm dark:bg-background/95 z-10 px-4 md:px-6">
          {/* Desktop: Breadcrumb only */}
          <div className="hidden md:flex">
            <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
          </div>

          {/* Mobile: Logo centered */}
          <Link href={props.basePath} className="flex md:hidden items-center gap-2 flex-1 justify-center">
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

        {/* Content with bottom padding on mobile for bottom nav */}
        <div className="flex-grow pb-0 md:pb-0 mb-20 md:mb-0">{props.children}</div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        items={bottomNavItems}
        basePath={props.basePath}
        user={user}
        onLogout={logout}
        onContactSupport={() => setIsContactFormOpen(true)}
        onManageModules={user ? () => setIsAddModuleOpen(true) : undefined}
      />

      {/* Module Manager */}
      {user ? (
        <ModuleManager open={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)} />
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
    </div>
  );
}
