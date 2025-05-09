import { env } from './env';
import { polar } from './polar';
import { createClient } from './supabase/server';

export const getSubscribedUser = async () => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data?.user) {
    throw new Error('Create an account to use AI features.');
  }

  if (!data.user.user_metadata.polar_subscription_id) {
    throw new Error('Please claim your free AI credits to use AI features.');
  }

  const state = await polar.customers.getStateExternal({
    externalId: data.user.id,
  });

  const meter = state.activeMeters?.find(
    (m) => m.meterId === env.POLAR_CREDITS_METER_ID
  );

  const hasHobbySubscription = state.activeSubscriptions.some(
    (s) => s.productId === env.POLAR_HOBBY_PRODUCT_ID
  );

  if (!meter) {
    throw new Error('No credits meter found');
  }

  if (meter.balance <= 0 && hasHobbySubscription) {
    throw new Error(
      'Sorry, you have no credits remaining! Please upgrade for more credits.'
    );
  }

  return data.user;
};
