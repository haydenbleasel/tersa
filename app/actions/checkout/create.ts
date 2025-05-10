'use server';

import { currentUser, currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { polar } from '@/lib/polar';

export const createCheckoutLink = async (): Promise<
  | {
      url: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const profile = await currentUserProfile();

    if (!profile.customerId) {
      throw new Error('Customer ID not found');
    }

    const checkout = await polar.checkouts.create({
      products: [env.POLAR_HOBBY_PRODUCT_ID],
      customerId: profile.customerId,
    });

    return { url: checkout.url };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
