import { stripe } from '@/lib/stripe';
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
  const stripeCustomerId = user?.user_metadata.stripe_customer_id;
  const stripeSubscription = stripeCustomerId
    ? await stripe.subscriptions.retrieve(stripeCustomerId)
    : undefined;

  const currentPlan = stripeSubscription?.items.data[0].plan.id;

  return <Hero userId={user?.id} currentPlan={currentPlan} />;
};

export default PricingPage;
