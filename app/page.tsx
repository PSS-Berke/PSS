'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';
import LoadingSpinner from '@/components/loading-spinner';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If not authenticated, redirect to signin
        router.push('/auth/signin');
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth and redirecting
  return <LoadingSpinner />;
}
