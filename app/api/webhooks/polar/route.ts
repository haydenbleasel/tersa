import { env } from '@/lib/env';
import { Webhooks } from '@polar-sh/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onSubscriptionCreated: async (subscription) => {
    const userId = subscription.data.customer.externalId;

    if (!userId) {
      throw new Error('User ID not found');
    }

    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        polar_subscription_id: subscription.data.id,
      },
    });
  },
  onSubscriptionUpdated: async (subscription) => {
    const userId = subscription.data.customer.externalId;

    if (!userId) {
      throw new Error('User ID not found');
    }

    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        polar_subscription_id: undefined,
      },
    });
  },
});
