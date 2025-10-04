'use client';

import React from 'react';
import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { useAuth } from "@/lib/xano/auth-context";
import { BadgePercent, BarChart4, Columns3, Globe, Locate, Settings2, ShoppingBag, ShoppingCart, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const navigationItems: SidebarItem[] = [
  {
    name: "Overview",
    href: "/",
    icon: Globe,
    type: "item",
  },
  {
    type: 'label',
    name: 'Core',
  },
  {
    name: "People",
    href: "/people",
    icon: Users,
    type: "item",
  },
  {
    name: "Revenue",
    href: "/revenue",
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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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