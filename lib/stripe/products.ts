/**
 * Stripe Product Definitions
 *
 * Define the 4 pricing tiers and their Stripe price IDs.
 *
 * TODO: Create products and prices in Stripe Dashboard, then add the price IDs here
 * 1. Go to https://dashboard.stripe.com/products
 * 2. Create 4 products (Pro, Max, Enterprise, Agency)
 * 3. Add monthly and annual prices to each product
 * 4. Copy the price IDs (price_xxx) and paste them below
 */

export type TierName = 'pro' | 'max' | 'enterprise' | 'agency';

export interface PricingTier {
  id: TierName;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceIdMonthly: string; // TODO: Add from Stripe Dashboard
  stripePriceIdAnnual: string; // TODO: Add from Stripe Dashboard
  features: string[];
  limits: {
    users: number | 'unlimited';
    voipMinutes: number;
    enrichments: number;
    callReports: number | 'unlimited';
    linkedInCampaigns: number | 'unlimited';
    battleCards: number | 'unlimited';
  };
}

export const pricingTiers: Record<TierName, PricingTier> = {
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For individual sales professionals building their personal brand',
    monthlyPrice: 79,
    annualPrice: 790, // 2 months free: 79 * 10
    stripePriceIdMonthly: '', // TODO: Add Stripe price ID
    stripePriceIdAnnual: '', // TODO: Add Stripe price ID
    features: [
      'Social Media Copilot (personal accounts)',
      'Call Prep Assistant (25 reports/month)',
      'Phone/VoIP System (500 minutes)',
      '50 Contact Enrichments',
      'Basic AI features',
      '1 user seat',
      'Email support',
    ],
    limits: {
      users: 1,
      voipMinutes: 500,
      enrichments: 50,
      callReports: 25,
      linkedInCampaigns: 0,
      battleCards: 0,
    },
  },
  max: {
    id: 'max',
    name: 'Max',
    description: 'For power users and small teams who need the full suite',
    monthlyPrice: 199,
    annualPrice: 1990, // 2 months free: 199 * 10
    stripePriceIdMonthly: '', // TODO: Add Stripe price ID
    stripePriceIdAnnual: '', // TODO: Add Stripe price ID
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
    limits: {
      users: 3,
      voipMinutes: 2000,
      enrichments: 250,
      callReports: 100,
      linkedInCampaigns: 10,
      battleCards: 20,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For growing sales teams that need advanced collaboration',
    monthlyPrice: 499,
    annualPrice: 4990, // 2 months free: 499 * 10
    stripePriceIdMonthly: '', // TODO: Add Stripe price ID
    stripePriceIdAnnual: '', // TODO: Add Stripe price ID
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
    limits: {
      users: 10,
      voipMinutes: 5000,
      enrichments: 1000,
      callReports: 500,
      linkedInCampaigns: 50,
      battleCards: 100,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'For agencies managing multiple clients',
    monthlyPrice: 999,
    annualPrice: 9990, // 2 months free: 999 * 10
    stripePriceIdMonthly: '', // TODO: Add Stripe price ID
    stripePriceIdAnnual: '', // TODO: Add Stripe price ID
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
    limits: {
      users: 'unlimited',
      voipMinutes: 10000,
      enrichments: 2500,
      callReports: 'unlimited',
      linkedInCampaigns: 'unlimited',
      battleCards: 'unlimited',
    },
  },
};

/**
 * Get tier information by tier name
 */
export function getTierByName(tierName: TierName): PricingTier | null {
  return pricingTiers[tierName] || null;
}

/**
 * Get Stripe price ID based on tier and billing cycle
 */
export function getStripePriceId(tierName: TierName, isAnnual: boolean): string {
  const tier = getTierByName(tierName);
  if (!tier) return '';
  return isAnnual ? tier.stripePriceIdAnnual : tier.stripePriceIdMonthly;
}

/**
 * Calculate price for display
 */
export function formatPrice(cents: number, isAnnual: boolean = false): string {
  const price = isAnnual ? Math.floor(cents / 10) : cents;
  return `$${price}`;
}
