'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function BrandMark({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3"
      aria-label="Parallel Strategies home"
    >
      <span
        className={
          isDark
            ? 'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur'
            : 'flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C33527]/30 bg-[#C33527]/10'
        }
      >
        <Image
          src="/White%20logo.png"
          alt="Parallel Strategies logo"
          width={36}
          height={36}
          className="h-8 w-8 object-contain"
          priority
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-[#C33527]'}>
          Parallel Strategies
        </span>
        <span className={isDark ? 'text-sm text-white/70' : 'text-sm text-[#C33527]/70'}>
          Control Center
        </span>
      </span>
    </Link>
  );
}

interface InviteData {
  name: string;
  email: string;
  admin: boolean;
}

export default function AcceptInvitePage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Fetch invite data on mount
  useEffect(() => {
    const fetchInviteData = async () => {
      if (!token) {
        setError('No invitation token provided');
        setIsLoadingData(false);
        return;
      }

      try {
        const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf/invite/accept/get_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Invalid or expired invitation link');
        }

        const data = await response.json();
        setInviteData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invitation details');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInviteData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('No invitation token provided');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to accept invitation');
      }

      // Navigate to signin with success message
      router.push('/auth/signin?accepted=true');
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1F0B0B] via-[#421312] to-[#C33527] px-4 py-12 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-6xl min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/80 shadow-[0_20px_60px_-20px_rgba(195,53,39,0.45)] backdrop-blur-lg lg:h-[75vh] lg:max-h-[80vh] lg:grid lg:grid-cols-[1fr_1fr]">
        <div className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-[#C33527] via-[#9E2A1F] to-[#53110C] p-12 text-white lg:flex">
          <div className="space-y-10">
            <BrandMark variant="dark" />
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                You&apos;ve been invited.
              </h2>
              <p className="text-base leading-7 text-white/80">
                Accept your invitation to join the Parallel Strategies control center and start 
                collaborating with your team using our unified red-themed experience.
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="font-medium">Already have an account?</p>
            <Link href="/auth/signin" className="inline-flex items-center gap-1 font-semibold text-white hover:text-white/80">
              Sign in instead
            </Link>
          </div>
          <p className="text-xs text-white/50">© {currentYear} Parallel Strategies. All rights reserved.</p>
        </div>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:h-full">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <Card className="border border-border/50 shadow-lg shadow-[#C33527]/20">
              <CardHeader className="space-y-3 text-center">
                <CardTitle className="text-3xl font-semibold text-[#C33527]">Accept Invitation</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Set your password to complete your account setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C33527] border-t-transparent"></div>
                  </div>
                ) : error && !inviteData ? (
                  <div className="space-y-4">
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {error}
                    </div>
                    <Link href="/auth/signin">
                      <Button
                        className="w-full rounded-lg bg-[#C33527] py-2.5 text-base font-medium text-white shadow-md shadow-[#C33527]/20 transition-colors hover:bg-[#a32a1f]"
                      >
                        Go to Sign In
                      </Button>
                    </Link>
                  </div>
                ) : inviteData ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-base font-semibold">{inviteData.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base font-semibold">{inviteData.email}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <Badge variant={inviteData.admin ? "default" : "secondary"} className={inviteData.admin ? "bg-[#C33527] hover:bg-[#a32a1f]" : ""}>
                          {inviteData.admin ? 'Admin' : 'User'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="password" className="text-sm font-medium text-muted-foreground/90">
                        Create Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-muted focus-visible:ring-[#C33527] focus-visible:ring-offset-2"
                      />
                    </div>

                    {error && inviteData && (
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full rounded-lg bg-[#C33527] py-2.5 text-base font-medium text-white shadow-md shadow-[#C33527]/20 transition-colors hover:bg-[#a32a1f]"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Accepting Invitation…' : 'Accept Invitation'}
                    </Button>
                  </form>
                ) : null}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="font-semibold text-[#C33527] hover:text-[#9E2A1F]">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

