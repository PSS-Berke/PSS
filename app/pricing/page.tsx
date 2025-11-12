'use client';

import React, { useState } from 'react';
import { PricingGrid } from '@/components/pricing';
import {
  PricingComparisonTable,
  PricingComparisonMobile,
} from '@/components/pricing-comparison-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingData = [
    {
      title: 'Pro',
      price: '$50',
      annualPrice: '$420',
      annualPriceID: 'price_1SRuACPqeVBvE9tI0iIo0kKt',
      monthlyPriceID: 'price_1SRu6RPqeVBvE9tIW2VqQRRx',
      description: 'For individual sales professionals building their personal brand',
      features: [
        'Social Media Copilot (personal accounts)',
        'Call Prep Assistant (25 reports/month)',
        'Phone/VoIP System (500 minutes)',
        '50 Contact Enrichments',
        'Basic AI features',
        '1 user seat',
        'Email support',
      ],
      buttonText: 'Start with Pro',
      buttonHref: '/auth/signup?tier=pro',
      isPopular: false,
      isAnnual,
      highlight: 'Perfect for solo entrepreneurs',
    },
    {
      title: 'Max',
      price: '$100',
      annualPrice: '$840',
      annualPriceID: 'price_1SRu7oPqeVBvE9tIIk6fkDMV',
      monthlyPriceID: 'price_1SRwG5PqeVBvE9tIANzO1aYG',
      description: 'For power users and small teams who need the full suite',
      features: [
        'All 9 social platforms',
        'LinkedIn Copilot (10 campaigns)',
        'Battle Cards (20/month)',
        'Call Prep (100 reports)',
        'Analytics integration',
        'VoIP (2,000 minutes)',
        '250 enrichments with premium data',
        '3 user seats',
        'Priority support',
      ],
      buttonText: 'Start with Max',
      buttonHref: '/auth/signup?tier=max',
      isPopular: true,
      isAnnual,
      highlight: 'Save $334/mo vs buying separately',
    },
    {
      title: 'Enterprise',
      price: '$150',
      annualPrice: '$1,260',
      annualPriceID: 'price_1SRu8gPqeVBvE9tIhWixuErG',
      monthlyPriceID: 'price_1SRrt4PqeVBvE9tIUMSEdV8y',
      description: 'For growing sales teams that need advanced collaboration',
      features: [
        'Everything in Max, plus:',
        'LinkedIn Copilot (50 campaigns)',
        'Battle Cards (100/month)',
        'Call Prep (500 reports)',
        'Team analytics & reporting',
        'VoIP (5,000 minutes)',
        '1,000 enrichments',
        'Bulk enrichment tools',
        '10 user seats ($49.90/seat)',
        'Custom dashboards',
        'API access',
        'Priority support',
      ],
      buttonText: 'Start with Enterprise',
      buttonHref: '/auth/signup?tier=enterprise',
      isPopular: false,
      isAnnual,
      highlight: 'Save $801/mo vs Outreach',
    },
    {
      title: 'Agency',
      price: '$150',
      annualPrice: '$1,260',
      annualPriceID: 'price_1SRu9OPqeVBvE9tILSMDEhzN',
      monthlyPriceID: 'price_1SRrssPqeVBvE9tIG45qW4gi',
      description: 'For agencies managing multiple clients',
      features: [
        'Everything in Enterprise, plus:',
        'Unlimited campaigns',
        'Unlimited battle cards',
        'Unlimited call reports',
        'VoIP (10,000 minutes)',
        '2,500 enrichments',
        'Unlimited client management',
        'White label option',
        'Unlimited user seats',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      buttonText: 'Start with Agency',
      buttonHref: '/auth/signup?tier=agency',
      isPopular: false,
      isAnnual,
      highlight: 'Save $1,000-2,500/mo vs separate tools',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-950/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            PSS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            One Platform. <span className="text-primary">Everything You Need.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop paying for 6+ separate tools. Get social media management, sales intelligence,
            LinkedIn automation, VoIP, and AI assistants all in one platform.
          </p>

          {/* Savings Callout */}
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-lg mb-1">Save 46-71% vs. buying separately</p>
                  <p className="text-sm text-muted-foreground">
                    Competitors charge $423-708/month for similar tools. Our Max tier is just
                    $199/month for everything.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 py-4">
            <span
              className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Annual
            </span>
            {isAnnual && <span className="text-sm text-primary font-semibold">Save 2 months!</span>}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <PricingGrid title="" subtitle="" items={pricingData} className="py-0" />

      {/* Feature Comparison */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Features</h2>
          <p className="text-muted-foreground text-lg">
            See exactly what&apos;s included in each plan
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <PricingComparisonTable />
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          <PricingComparisonMobile />
        </div>
      </div>

      <Separator className="my-12" />

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                  immediately, and we&apos;ll prorate the difference.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Do you offer a free trial?</h3>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee on all plans. Try any tier risk-free, and
                  if it&apos;s not right for you, we&apos;ll refund your payment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank
                  transfers for annual plans.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  What happens if I exceed my usage limits?
                </h3>
                <p className="text-muted-foreground">
                  We&apos;ll notify you when you&apos;re approaching your limits. You can either
                  upgrade to a higher tier or purchase add-on packages for additional capacity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Is Stripe integration included?</h3>
                <p className="text-muted-foreground">
                  Payment processing via Stripe will be integrated soon. For now, you can sign up
                  and we&apos;ll set up billing manually.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join sales professionals and agencies who are saving thousands while getting more done
              with our all-in-one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Parallel Strategies Sales Performance Suite. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
