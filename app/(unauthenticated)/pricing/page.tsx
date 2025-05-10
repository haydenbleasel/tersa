import { currentUser, currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import type { Metadata } from 'next';
import { Hero } from './components/hero';

export const metadata: Metadata = {
  title: 'Tersa | Pricing',
  description: 'Choose a plan to get access to all features.',
};

const PricingPage = async () => {
  const user = await currentUser();
  let currentPlan: 'hobby' | 'pro' | undefined;

  if (user) {
    const profile = await currentUserProfile();

    if (profile.productId === env.POLAR_HOBBY_PRODUCT_ID) {
      currentPlan = 'hobby';
    } else if (
      profile.productId === env.POLAR_PRO_PRODUCT_MONTHLY_ID ||
      profile.productId === env.POLAR_PRO_PRODUCT_YEARLY_ID
    ) {
      currentPlan = 'pro';
    }
  }

  return <Hero userId={user?.id} currentPlan={currentPlan} />;
};

export default PricingPage;
