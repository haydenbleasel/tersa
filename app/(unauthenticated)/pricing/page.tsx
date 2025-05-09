import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Hero } from './components/hero';

export const metadata: Metadata = {
  title: 'Tersa | Pricing',
  description: 'Choose a plan to get access to all features.',
};

const PricingPage = async () => {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  let currentPlan: string | undefined;

  if (user) {
    if (
      user.user_metadata.polar_subscription_id === env.POLAR_HOBBY_PRODUCT_ID
    ) {
      currentPlan = 'hobby';
    } else if (
      user.user_metadata.polar_subscription_id === env.POLAR_PRO_PRODUCT_ID
    ) {
      currentPlan = 'pro';
    }
  }

  return <Hero userId={user?.id} currentPlan={currentPlan} />;
};

export default PricingPage;
