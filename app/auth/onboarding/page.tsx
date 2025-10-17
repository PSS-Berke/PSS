'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/xano/auth-context';
import { authApi } from '@/lib/xano/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function BrandMark({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';

  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Parallel Strategies home">
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
        <span
          className={
            isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-[#C33527]'
          }
        >
          Parallel Strategies
        </span>
        <span className={isDark ? 'text-sm text-white/70' : 'text-sm text-[#C33527]/70'}>
          Control Center
        </span>
      </span>
    </Link>
  );
}

export default function SignUpPage() {
  const [company, setCompany] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { onboardCompany } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onboardCompany({
        company,
        company_code: companyCode ? parseInt(companyCode) : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
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
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">Onboarding.</h2>
              <p className="text-base leading-7 text-white/80">
                Complete your onboarding to join Parallel Strategies to collaborate with your team,
                orchestrate campaigns, and build a consistent brand presence with our red-themed
                intelligence hub.
              </p>
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {currentYear} Parallel Strategies. All rights reserved.
          </p>
        </div>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 lg:py-14">
          <div className="flex h-full w-full flex-col lg:max-w-none">
            <div className="mb-8 flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <Card className="flex h-full w-full flex-col border border-border/50 shadow-lg shadow-[#C33527]/20">
              <CardHeader className="space-y-3 lg:shrink-0 lg:text-left">
                <CardTitle className="text-3xl font-semibold text-[#C33527]">
                  Create account
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Set up your workspace credentials to begin
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-1 sm:pr-2 lg:pr-3">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2 text-left">
                    <Label
                      htmlFor="company"
                      className="text-sm font-medium text-muted-foreground/90"
                    >
                      Company
                    </Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your Company"
                      value={company}
                      required
                      onChange={(e) => setCompany(e.target.value)}
                      className="border-muted focus-visible:ring-[#C33527] focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label
                      htmlFor="companyCode"
                      className="text-sm font-medium text-muted-foreground/90"
                    >
                      Company Code
                    </Label>
                    <Input
                      id="companyCode"
                      type="number"
                      placeholder="Company Code (optional)"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      className="border-muted focus-visible:ring-[#C33527] focus-visible:ring-offset-2"
                    />
                  </div>

                  {success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                      Onboarding completed! Thank you for joining Parallel Strategies.
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-[#C33527] py-2.5 text-base font-medium text-white shadow-md shadow-[#C33527]/20 transition-colors hover:bg-[#a32a1f]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Completing onboarding…' : 'Complete onboarding'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
