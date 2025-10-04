'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';
import HandlerHeader from "@/components/handler-header";
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

  return (
    <div className="flex flex-col h-screen">
      <HandlerHeader />
      <div className="flex-grow">
        {props.children}
      </div>
    </div>
  );
}