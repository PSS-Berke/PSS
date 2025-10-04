'use client';

import React from 'react';
import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { useAuth } from "@/lib/xano/auth-context";
import { Home, Zap, BarChart4 } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/loading-spinner';


const navigationItems: SidebarItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
    type: "item",
  },
  {
    name: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
    type: "item",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart4,
    type: "item",
  },
];

export default function Layout(props: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If not authenticated, don't immediately redirect away — show a sign-in prompt instead.
  // This makes the layout (sidebar + theme toggle) visible for debugging and for
  // users who may want to sign in from the dashboard route. If you prefer a hard
  // redirect, re-enable the router.push in the effect below.
  React.useEffect(() => {
    // Example: to force redirect, uncomment the lines below
    // if (!isLoading && !user) {
    //   router.push('/');
    // }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Show a simple sign-in prompt while unauthenticated. The sidebar is still
    // rendered (so the user can access theme toggle and navigation), but main
    // content asks the user to sign in.
    return (
      <SidebarLayout 
        items={navigationItems}
        basePath="/dashboard"
        baseBreadcrumb={[{
          title: "Dashboard",
          href: "/dashboard",
        }]}
      >
        <div className="p-8">
          <h2 className="text-2xl font-semibold">Please sign in</h2>
          <p className="mt-2 text-muted-foreground">You must be signed in to access dashboard content.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout 
      items={navigationItems}
      basePath="/dashboard"
      baseBreadcrumb={[{
        title: "Dashboard",
        href: "/dashboard",
      }]}
    >
      {props.children}
    </SidebarLayout>
  );
}
