# Stripe Integration Plan

This document outlines the steps to complete Stripe payment integration for the Parallel Strategies Sales Performance Suite pricing page.

## Current Status

✅ **Phase 1-5 Complete:**
- Pricing page created at `/app/pricing`
- Enhanced pricing components with tier details
- Feature comparison table (desktop & mobile)
- Signup page accepts tier parameter
- Stripe scaffolding files created
- Middleware updated for public pricing route
- Navigation links added to signin and root pages

## Next Steps for Stripe Integration

### 1. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Set Up Stripe Account

1. Create account at [https://stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Add keys to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Create Products & Prices in Stripe Dashboard

Go to [https://dashboard.stripe.com/products](https://dashboard.stripe.com/products) and create:

#### Pro Tier
- **Product Name:** Pro
- **Monthly Price:** $79.00 USD
- **Annual Price:** $790.00 USD (billed annually)
- Copy price IDs to `/lib/stripe/products.ts`

#### Max Tier
- **Product Name:** Max
- **Monthly Price:** $199.00 USD
- **Annual Price:** $1,990.00 USD (billed annually)
- Copy price IDs to `/lib/stripe/products.ts`

#### Enterprise Tier
- **Product Name:** Enterprise
- **Monthly Price:** $499.00 USD
- **Annual Price:** $4,990.00 USD (billed annually)
- Copy price IDs to `/lib/stripe/products.ts`

#### Agency Tier
- **Product Name:** Agency
- **Monthly Price:** $999.00 USD
- **Annual Price:** $9,990.00 USD (billed annually)
- Copy price IDs to `/lib/stripe/products.ts`

### 4. Update Xano Database Schema

Add the following fields to your User table in Xano:

| Field Name | Type | Description |
|------------|------|-------------|
| `subscription_tier` | Text | pro, max, enterprise, agency |
| `subscription_status` | Text | active, inactive, cancelled, past_due, trial |
| `stripe_customer_id` | Text | Stripe customer ID (cus_xxx) |
| `stripe_subscription_id` | Text | Stripe subscription ID (sub_xxx) |
| `billing_cycle` | Text | monthly, annual |
| `subscription_start_date` | DateTime | When subscription started |
| `subscription_end_date` | DateTime | When subscription ends/renews |
| `trial_end_date` | DateTime | When trial period ends (optional) |

Update `/lib/xano/types.ts` to include these fields in the User interface:

```typescript
interface User {
  // ... existing fields
  subscription_tier?: 'pro' | 'max' | 'enterprise' | 'agency';
  subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trial';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  billing_cycle?: 'monthly' | 'annual';
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_end_date?: string;
}
```

### 5. Implement Checkout Flow

Update `/app/api/stripe/checkout/route.ts`:

1. Uncomment and implement Stripe checkout session creation
2. Add customer email pre-fill
3. Add metadata for tier tracking
4. Set success and cancel URLs

Example implementation:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create checkout session
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  customer_email: email,
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup?payment=success&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=cancelled`,
  metadata: { tier, isAnnual: isAnnual.toString() },
  allow_promotion_codes: true,
  billing_address_collection: 'auto',
});

return NextResponse.json({ url: session.url });
```

### 6. Implement Webhook Handler

Update `/app/api/stripe/webhook/route.ts`:

1. Verify webhook signature
2. Handle events:
   - `checkout.session.completed`: Create/update user subscription in Xano
   - `customer.subscription.updated`: Update subscription status
   - `customer.subscription.deleted`: Mark as cancelled
   - `invoice.payment_failed`: Handle payment failures

Example webhook setup:

```bash
# Install Stripe CLI for testing
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 7. Update Pricing Page to Connect to Stripe

Modify `/app/pricing/page.tsx`:

1. Import Stripe checkout function
2. Update button onClick to call checkout API
3. Handle loading and error states

Example button handler:

```typescript
const handleCheckout = async (tier: string, isAnnual: boolean) => {
  const priceId = getStripePriceId(tier as TierName, isAnnual);

  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, tier, isAnnual }),
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

### 8. Implement Customer Portal

Update `/app/api/stripe/portal/route.ts`:

1. Uncomment portal session creation
2. Add to settings page for subscription management

### 9. Create Subscription Management UI

Add to `/app/settings/subscription/page.tsx`:

- Display current tier and billing cycle
- Show next billing date
- Show payment method
- "Manage Subscription" button (links to Stripe portal)
- "Change Plan" button (links to pricing page)
- "Cancel Subscription" option

### 10. Testing Checklist

- [ ] Test monthly checkout for each tier
- [ ] Test annual checkout for each tier
- [ ] Test successful payment flow
- [ ] Test cancelled checkout
- [ ] Test webhook for subscription created
- [ ] Test webhook for subscription updated
- [ ] Test webhook for subscription cancelled
- [ ] Test failed payment webhook
- [ ] Test customer portal access
- [ ] Test plan upgrades
- [ ] Test plan downgrades
- [ ] Test cancellation flow

### 11. Production Deployment

1. **Switch to Live Mode:**
   - Get live API keys from Stripe Dashboard
   - Update environment variables in production
   - Create live products and prices in Stripe

2. **Configure Webhooks:**
   - Add webhook endpoint in Stripe Dashboard
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for

3. **Security:**
   - Ensure webhook signature verification is enabled
   - Use HTTPS only
   - Never expose secret keys in client-side code

## Additional Features to Consider

### Promotional Pricing
- Implement founder's pricing (20% off for early adopters)
- Create coupon codes in Stripe Dashboard
- Add `allow_promotion_codes: true` to checkout

### Free Trial
- Add trial period to Stripe subscriptions (14 days)
- Update checkout to include trial
- Add trial expiration notices

### Usage-Based Billing
- Track usage in Xano (VoIP minutes, enrichments, etc.)
- Implement overage charges
- Add usage meters in Stripe

### Team Billing
- Handle multi-seat pricing
- Implement quantity updates for Enterprise/Agency tiers
- Prorate seat additions/removals

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Cards](https://stripe.com/docs/testing)

## Support

For questions about this integration:
1. Check Stripe documentation
2. Review Xano API documentation
3. Test with Stripe test mode first
4. Use Stripe CLI for local webhook testing

---

**Document Version:** 1.0
**Created:** 2025-11-09
**Status:** Ready for Stripe activation
