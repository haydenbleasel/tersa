import { createClient } from './supabase/server';

export const getSubscribedUser = async () => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data?.user) {
    throw new Error('Create an account to use AI features.');
  }

  if (!data.user.user_metadata.stripeSubscriptionId) {
    throw new Error('Please claim your free AI credits to use AI features.');
  }

  return data.user;
};
