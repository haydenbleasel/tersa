import { currentUser, currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { stripe } from '@/lib/stripe';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const successUrl = `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`;

const getFrequencyPrice = async (
  productId: string,
  frequency: Stripe.Price.Recurring.Interval
) => {
  const prices = await stripe.prices.list({
    product: productId,
  });

  if (prices.data.length === 0) {
    throw new Error('Product prices not found');
  }

  const price = prices.data.find(
    (price) => price.recurring?.interval === frequency
  );

  if (!price) {
    throw new Error('Price not found');
  }

  return price.id;
};

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get('product');
  const frequency = searchParams.get('frequency');

  const user = await currentUser();

  if (!user) {
    return new Response('You must be logged in to subscribe', { status: 401 });
  }

  if (typeof productName !== 'string') {
    return new Response('Missing product', { status: 400 });
  }

  if (typeof frequency !== 'string') {
    return new Response('Missing frequency', { status: 400 });
  }

  if (frequency !== 'month' && frequency !== 'year') {
    return new Response('Invalid frequency', { status: 400 });
  }

  const profile = await currentUserProfile();

  if (!profile) {
    return new Response('Profile not found', { status: 404 });
  }

  if (!profile.customerId && !user.email) {
    return new Response('Customer ID or email not found', { status: 400 });
  }

  try {
    // Determine the target product ID
    const targetProductId =
      productName === 'hobby'
        ? env.STRIPE_HOBBY_PRODUCT_ID
        : env.STRIPE_PRO_PRODUCT_ID;

    // Check if user already has an active subscription
    if (profile.subscriptionId) {
      // User has an existing subscription - update it instead of creating new one
      const existingSubscription = await stripe.subscriptions.retrieve(
        profile.subscriptionId
      );

      // Check if they're already on this plan
      const currentProductId = existingSubscription.items.data[0]?.price
        .product as string;

      if (currentProductId === targetProductId) {
        // Already on this plan, redirect to billing portal instead
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.customerId as string,
          return_url: successUrl,
        });

        return NextResponse.redirect(portalSession.url);
      }

      // Get the new prices for the target plan
      const newPlanPrice = await getFrequencyPrice(
        targetProductId,
        productName === 'hobby' ? 'month' : frequency
      );
      const newUsagePrice = await getFrequencyPrice(
        env.STRIPE_USAGE_PRODUCT_ID,
        productName === 'hobby' ? 'month' : frequency
      );

      // Update the existing subscription items
      const updatedSubscription = await stripe.subscriptions.update(
        profile.subscriptionId,
        {
          items: [
            {
              id: existingSubscription.items.data[0].id,
              price: newPlanPrice,
              quantity: 1,
            },
            {
              id: existingSubscription.items.data[1]?.id,
              price: newUsagePrice,
            },
          ],
          proration_behavior: 'always_invoice',
          metadata: {
            userId: user.id,
          },
        }
      );

      if (!updatedSubscription) {
        throw new Error('Failed to update subscription');
      }

      // Redirect to success page
      return NextResponse.redirect(successUrl);
    }

    // User doesn't have a subscription - create a new one via checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (productName === 'hobby') {
      lineItems.push(
        {
          price: await getFrequencyPrice(env.STRIPE_HOBBY_PRODUCT_ID, 'month'),
          quantity: 1,
        },
        {
          price: await getFrequencyPrice(env.STRIPE_USAGE_PRODUCT_ID, 'month'),
        }
      );
    } else if (productName === 'pro') {
      lineItems.push(
        {
          price: await getFrequencyPrice(env.STRIPE_PRO_PRODUCT_ID, frequency),
          quantity: 1,
        },
        {
          price: await getFrequencyPrice(env.STRIPE_USAGE_PRODUCT_ID, frequency),
        }
      );
    }

    const checkoutLink = await stripe.checkout.sessions.create({
      customer: profile.customerId ?? undefined,
      customer_email: profile.customerId ? undefined : user.email,
      line_items: lineItems,
      success_url: successUrl,
      allow_promotion_codes: true,
      mode: 'subscription',
      payment_method_collection:
        productName === 'hobby' ? 'if_required' : 'always',
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    if (!checkoutLink.url) {
      throw new Error('Checkout link not found');
    }

    return NextResponse.redirect(checkoutLink.url);
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
