import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const url = `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const GET = async (): Promise<Response> => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data.user) {
    return new Response(null, { status: 404 });
  }

  const { stripeCustomerId } = data.user.user_metadata;

  if (!stripeCustomerId) {
    return new Response(null, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: url,
    });

    return NextResponse.redirect(session.url, { status: 302 });
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
