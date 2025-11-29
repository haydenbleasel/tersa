import { database } from '@/lib/database';
import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { stripe } from '@/lib/stripe';
import { profile } from '@/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const message = parseError(error);

    return new NextResponse(`Error verifying webhook signature: ${message}`, {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        if (!subscription.metadata.userId) {
          throw new Error('User ID not found');
        }

        // Get customer to find the user ID
        const customer = await stripe.customers.retrieve(customerId);

        if (customer.deleted) {
          throw new Error('Customer is deleted');
        }

        // Update the profile with the subscription details
        await database
          .update(profile)
          .set({
            customerId,
            subscriptionId: subscription.id,
            productId: subscription.items.data[0]?.price.product as string,
          })
          .where(eq(profile.id, subscription.metadata.userId));

        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        if (!subscription.metadata.userId) {
          throw new Error('User ID not found');
        }

        const userProfile = await database.query.profile.findFirst({
          where: eq(profile.id, subscription.metadata.userId),
        });

        if (!userProfile) {
          throw new Error('Profile not found');
        }

        if (userProfile.subscriptionId === subscription.id) {
          await database
            .update(profile)
            .set({
              subscriptionId: null,
              productId: null,
            })
            .where(eq(profile.id, subscription.metadata.userId));
        }

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    const message = parseError(error);

    return new NextResponse(`Error processing webhook: ${message}`, {
      status: 500,
    });
  }
}
