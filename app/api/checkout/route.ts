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
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (!profile) {
    return new Response('Profile not found', { status: 404 });
  }

  if (!profile.customerId && !user.email) {
    return new Response('Customer ID or email not found', { status: 400 });
  }

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

  try {
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
