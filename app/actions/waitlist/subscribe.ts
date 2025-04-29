'use server';

import { env } from '@/lib/env';
import { parseError } from '@/lib/error/parse';
import { resend } from '@/lib/resend';

export const subscribeToWaitlist = async (
  email: string
): Promise<
  | {
      success: true;
    }
  | {
      error: string;
    }
> => {
  try {
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId: env.RESEND_WAITLIST_AUDIENCE_ID,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
