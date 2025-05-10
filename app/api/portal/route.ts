import { currentUserProfile } from '@/lib/auth';
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

    const profile = await currentUserProfile();

    const polarCustomerId = profile.customerId;

    if (typeof polarCustomerId !== 'string') {
      throw new Error('User has no Polar Customer ID');
    }

    return polarCustomerId;
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
