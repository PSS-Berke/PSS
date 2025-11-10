import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe Webhook Handler
 *
 * This endpoint receives webhook events from Stripe to handle subscription lifecycle events.
 *
 * TODO: Implement webhook handler
 * 1. Install Stripe: npm install stripe
 * 2. Verify webhook signature
 * 3. Handle different event types:
 *    - checkout.session.completed: Create user subscription in Xano
 *    - customer.subscription.updated: Update subscription status
 *    - customer.subscription.deleted: Cancel subscription
 *    - invoice.payment_failed: Handle failed payment
 *
 * Events to handle:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // TODO: Verify webhook signature
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: '2023-10-16',
    // });
    //
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );

    // TODO: Handle different event types
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     const session = event.data.object;
    //     // Update Xano user with subscription info
    //     break;
    //
    //   case 'customer.subscription.updated':
    //     const subscription = event.data.object;
    //     // Update subscription status in Xano
    //     break;
    //
    //   case 'customer.subscription.deleted':
    //     const deletedSubscription = event.data.object;
    //     // Mark subscription as cancelled in Xano
    //     break;
    //
    //   case 'invoice.payment_failed':
    //     const invoice = event.data.object;
    //     // Notify user of failed payment
    //     break;
    //
    //   default:
    //     console.log(`Unhandled event type: ${event.type}`);
    // }

    // Placeholder response
    return NextResponse.json(
      {
        message: 'Webhook endpoint not yet implemented',
        note: 'This will handle Stripe subscription events once configured',
      },
      { status: 501 } // 501 Not Implemented
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
