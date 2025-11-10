/**
 * Stripe Configuration
 *
 * This file contains the Stripe configuration for payment processing.
 *
 * TODO: Set up Stripe account and add environment variables
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

export const stripeConfig = {
  // Publishable key - safe to use in client-side code
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

  // Secret key - ONLY use server-side
  secretKey: process.env.STRIPE_SECRET_KEY || '',

  // Webhook secret for verifying webhook signatures
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Currency
  currency: 'usd',

  // Success and cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/signup?payment=success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
};

export const isStripeConfigured = () => {
  return !!(stripeConfig.publishableKey && stripeConfig.secretKey);
};
