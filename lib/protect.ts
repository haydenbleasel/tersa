import { createClient } from './supabase/server';

export const getSubscribedUser = async () => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data?.user) {
    throw new Error('Create an account to use AI features.');
  }

  if (data.user.user_metadata.isBanned) {
    throw new Error('You are banned from using AI features.');
  }

  // Should be temporarily disabled during beta
  if (!data.user.user_metadata.stripeSubscriptionId) {
    throw new Error('Please upgrade to a paid plan to use AI features.');
  }

  return data.user;
};
