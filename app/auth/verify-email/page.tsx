'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

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

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing');
        return;
      }

      try {
        const response = await fetch(
          `https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf/auth/call_back?token=${token}`
        );

        if (response.status === 200) {
          setStatus('success');
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/auth/signin?verified=true');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1F0B0B] via-[#421312] to-[#C33527] px-4 py-12 flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-6xl min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/80 shadow-[0_20px_60px_-20px_rgba(195,53,39,0.45)] backdrop-blur-lg lg:h-[75vh] lg:max-h-[80vh] lg:grid lg:grid-cols-[1fr_1fr]">
        <div className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-[#C33527] via-[#9E2A1F] to-[#53110C] p-12 text-white lg:flex">
          <div className="space-y-10">
            <BrandMark variant="dark" />
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Email Verification
              </h2>
              <p className="text-base leading-7 text-white/80">
                We're verifying your email address to complete your account setup.
                This will only take a moment.
              </p>
            </div>
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
                <CardTitle className="text-3xl font-semibold text-[#C33527]">
                  {status === 'verifying' && 'Verifying Email'}
                  {status === 'success' && 'Email Verified!'}
                  {status === 'error' && 'Verification Failed'}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {status === 'verifying' && 'Please wait while we verify your email address...'}
                  {status === 'success' && 'Your email has been successfully verified'}
                  {status === 'error' && 'There was a problem verifying your email'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-6 py-8">
                  {status === 'verifying' && (
                    <Loader2 className="h-16 w-16 animate-spin text-[#C33527]" />
                  )}

                  {status === 'success' && (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-600" />
                      <p className="text-center text-sm text-muted-foreground">
                        Redirecting you to the login page...
                      </p>
                    </>
                  )}

                  {status === 'error' && (
                    <>
                      <XCircle className="h-16 w-16 text-red-600" />
                      <div className="space-y-4 text-center">
                        <p className="text-sm text-red-600">{errorMessage}</p>
                        <Link
                          href="/auth/signin"
                          className="inline-block font-semibold text-[#C33527] hover:text-[#9E2A1F]"
                        >
                          Go to Sign In
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
