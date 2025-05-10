import { env } from '@/lib/env';
import { polar } from '@/lib/polar';
import { type NextRequest, NextResponse } from 'next/server';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const successUrl = `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get('product');
  const frequency = searchParams.get('frequency');
  const userId = searchParams.get('userId');

  if (typeof product !== 'string') {
    return new Response('Missing product', { status: 400 });
  }

  if (typeof frequency !== 'string') {
    return new Response('Missing frequency', { status: 400 });
  }

  let productId: string | undefined;

  if (product === 'hobby') {
    productId = env.POLAR_HOBBY_PRODUCT_ID;
  } else if (product === 'pro') {
    if (frequency === 'monthly') {
      productId = env.POLAR_PRO_PRODUCT_MONTHLY_ID;
    } else if (frequency === 'yearly') {
      productId = env.POLAR_PRO_PRODUCT_YEARLY_ID;
    } else {
      return new Response('Invalid frequency', { status: 400 });
    }
  } else {
    return new Response('Invalid product', { status: 400 });
  }

  const checkoutLink = await polar.checkouts.create({
    products: [productId],
    customerExternalId: userId,
    successUrl,
    allowDiscountCodes: true,
  });

  return NextResponse.redirect(checkoutLink.url);
};
