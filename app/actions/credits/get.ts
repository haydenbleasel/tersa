'use server';

import { parseError } from '@/lib/error/parse';
import { polar } from '@/lib/polar';
import { createClient } from '@/lib/supabase/server';

export const getCredits = async (): Promise<
  | {
      credits: number;
    }
  | {
      error: string;
    }
> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      throw new Error('User not found');
    }

    const externalCustomerId = data.user.id;
    const meters = await polar.customerMeters.list({
      externalCustomerId,
    });

    const creditsMeter = meters.result.items.find(
      (m) => m.meter.name === 'Credits' // Replace with your actual meter name if different
    );

    return { credits: creditsMeter?.balance ?? 0 };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
