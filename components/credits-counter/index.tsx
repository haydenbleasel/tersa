import { getCredits } from '@/app/actions/credits/get';
import { currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import { CreditsClient } from './client';

export const CreditsCounter = async () => {
  const credits = await getCredits();
  const profile = await currentUserProfile();

  if ('error' in credits) {
    return null;
  }

  return (
    <CreditsClient
      defaultCredits={credits.credits}
      canUpgrade={profile?.productId !== env.STRIPE_PRO_PRODUCT_ID}
    />
  );
};
