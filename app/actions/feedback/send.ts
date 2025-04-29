'use server';

import { env } from '@/lib/env';
import { resend } from '@/lib/resend';

export const sendFeedback = async (
  name: string,
  id: string,
  message: string
): Promise<
  | {
      success: true;
    }
  | {
      error: string;
    }
> => {
  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_EMAIL,
      to: env.RESEND_EMAIL,
      subject: `Tersa feedback from ${name} (${id})`,
      text: message,
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
