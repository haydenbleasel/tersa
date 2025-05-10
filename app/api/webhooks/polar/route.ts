import { database } from '@/lib/database';
import { env } from '@/lib/env';
import { profile } from '@/schema';
import { Webhooks } from '@polar-sh/nextjs';
import { eq } from 'drizzle-orm';

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onSubscriptionCreated: async (subscription) => {
    const userId = subscription.data.customer.externalId;

    console.log(JSON.stringify(subscription, null, 2), 'created');

    if (!userId) {
      throw new Error('User ID not found');
    }

    await database
      .update(profile)
      .set({
        subscriptionId: subscription.data.id,
        productId: subscription.data.product.id,
      })
      .where(eq(profile.id, userId));
  },
  onSubscriptionUpdated: async (subscription) => {
    const userId = subscription.data.customer.externalId;

    console.log(JSON.stringify(subscription, null, 2), 'updated');

    if (!userId) {
      throw new Error('User ID not found');
    }

    await database
      .update(profile)
      .set({
        subscriptionId: subscription.data.id,
        productId: subscription.data.product.id,
      })
      .where(eq(profile.id, userId));
  },
  onSubscriptionCanceled: async (subscription) => {
    const userId = subscription.data.customer.externalId;

    if (!userId) {
      throw new Error('User ID not found');
    }

    await database
      .update(profile)
      .set({
        subscriptionId: null,
        productId: null,
      })
      .where(eq(profile.id, userId));
  },
});
