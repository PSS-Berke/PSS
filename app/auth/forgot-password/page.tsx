'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequestPasswordReset } from '@/lib/services/UserService';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

// Zod validation schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await apiRequestPasswordReset(data.email);
      setSuccessMessage('Password reset link sent to your email');
      clearErrors();
    } catch (err: any) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Failed to request password reset',
      });
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
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">Forgot password?</h2>
              <p className="text-base leading-7 text-white/80">
                We will send you a password reset link to your email.
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="font-medium">Need an account?</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1 font-semibold text-white hover:text-white/80"
            >
              Create one now
            </Link>
          </div>
          <p className="text-xs text-white/50">
            © {currentYear} Parallel Strategies. All rights reserved.
          </p>
        </div>

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:h-full">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="flex justify-center lg:hidden">
              <BrandMark />
            </div>

            <Card className="border border-border/50 shadow-lg shadow-[#C33527]/20">
              <CardHeader className="space-y-3 text-center">
                <CardTitle className="text-3xl font-semibold text-[#C33527]">
                  Forgot your password
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Enter your email and we will sort you out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {errors.root && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {errors.root.message}
                    </div>
                  )}

                  <div className="space-y-2 text-left">
                    <Label htmlFor="email" className="text-sm font-medium text-muted-foreground/90">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        {...register('email')}
                        className={cn(
                          'pl-10 border-muted focus-visible:ring-[#C33527] focus-visible:ring-offset-2',
                          errors.email && 'border-red-500 focus:border-red-500',
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {successMessage && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                      {successMessage}
                    </div>
                  )}

                  <div className="flex flex-col justify-start gap-1">
                    <Button
                      type="submit"
                      className="w-full rounded-lg bg-[#C33527] py-2.5 text-base font-medium text-white shadow-md shadow-[#C33527]/20 transition-colors hover:bg-[#a32a1f]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Please wait…' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
