'use server';

import { env } from '@/lib/env';
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
    const message = error instanceof Error ? error.message : 'Unknown error';

    return { error: message };
  }
};
