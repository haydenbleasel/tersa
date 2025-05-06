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
  const currentPlan = 'hobby';

  return <Hero userId={user?.id} currentPlan={currentPlan} />;
};

export default PricingPage;
