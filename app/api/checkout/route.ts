import { env } from '@/lib/env';
import { Checkout } from '@polar-sh/nextjs';

const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN,
  successUrl: new URL(
    '/',
    `${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  ).toString(),
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
