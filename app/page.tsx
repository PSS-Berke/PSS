'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';
import LoadingSpinner from '@/components/loading-spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If authenticated, redirect to dashboard
        router.push('/dashboard');
      }
      // If not authenticated, stay on landing page (don't auto-redirect)
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return <LoadingSpinner />;
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-950/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">PSS</div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Your All-in-One <span className="text-primary">Sales Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Stop juggling multiple tools. Get social media management, sales intelligence, LinkedIn
            automation, VoIP, and AI assistants in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8">
                View Pricing
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Save 46-71% compared to buying tools separately
          </p>
        </div>
      </div>
    </div>
  );
}
