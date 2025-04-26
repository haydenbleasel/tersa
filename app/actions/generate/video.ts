'use server';

import { createClient } from '@/lib/supabase/server';

export const generateVideoAction = async (prompt: string) => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data?.user) {
    throw new Error('Create an account to use AI features.');
  }

  if (data.user.user_metadata.isBanned) {
    throw new Error('You are banned from using AI features.');
  }

  if (!data.user.user_metadata.stripeSubscriptionId) {
    throw new Error('Please upgrade to a paid plan to use AI features.');
  }

  const video = {
    uint8Array: new Uint8Array(),
    mimeType: 'video/mp4',
  };

  const result = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(video.uint8Array);
    }, 1000);
  });

  return result as Uint8Array;
};
