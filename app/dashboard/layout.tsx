'use client';

import React from 'react';
import { useAuth } from "@/lib/xano/auth-context";
import { useRouter } from "next/navigation";
import LoadingSpinner from '@/components/loading-spinner';

export default function Layout(props: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Show loading while redirecting
    return <LoadingSpinner />;
  }

  return <>{props.children}</>;
}
