'use server';

import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { polar } from '@/lib/polar';
import { createClient } from '@/lib/supabase/server';

export const createCheckoutLink = async (): Promise<
  | {
      url: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const { data } = await client.auth.getUser();
    const customerId = data.user?.user_metadata.polar_customer_id;

    if (!customerId) {
      throw new Error('Customer ID not found');
    }

    const checkout = await polar.checkouts.create({
      products: [env.POLAR_HOBBY_PRODUCT_ID],
      customerId,
    });

    return { url: checkout.url };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
