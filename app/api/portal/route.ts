// app/portal/route.ts
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { CustomerPortal } from '@polar-sh/nextjs';

export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: async () => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not found');
    }

    const polarCustomerId = user.user_metadata.polar_customer_id;

    if (typeof polarCustomerId !== 'string') {
      throw new Error('User has no Polar Customer ID');
    }

    return polarCustomerId;
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
