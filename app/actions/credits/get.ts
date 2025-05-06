'use server';

import { env } from '@/lib/env';
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
      (m) => m.meter.id === env.POLAR_CREDITS_METER_ID
    );

    return { credits: creditsMeter?.balance ?? 0 };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
