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

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect to login
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
