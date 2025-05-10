import { profile } from '@/schema';
import { eq } from 'drizzle-orm';
import { database } from './database';
import { env } from './env';
import { polar } from './polar';
import { createClient } from './supabase/server';

export const currentUser = async () => {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
};

export const currentUserProfile = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('User not found');
  }

  const userProfiles = await database
    .select()
    .from(profile)
    .where(eq(profile.id, user.id));
  const userProfile = userProfiles.at(0);

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  return userProfile;
};

export const getSubscribedUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Create an account to use AI features.');
  }

  const profile = await currentUserProfile();

  if (!profile.subscriptionId) {
    throw new Error('Please claim your free AI credits to use AI features.');
  }

  if (!profile.customerId) {
    throw new Error('Customer ID not found');
  }

  const state = await polar.customers.getState({
    id: profile.customerId,
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

  return user;
};
