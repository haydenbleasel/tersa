import { currentUserProfile } from '@/lib/auth';
import { env } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { PostHogIdentifyProvider } from '@/providers/posthog-provider';
import {
  type SubscriptionContextType,
  SubscriptionProvider,
} from '@/providers/subscription';
import { ReactFlowProvider } from '@xyflow/react';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

const AuthenticatedLayout = async ({ children }: AuthenticatedLayoutProps) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/auth/login');
  }

  const profile = await currentUserProfile();

  if (!profile) {
    return null;
  }

  let plan: SubscriptionContextType['plan'];

  if (profile.productId === env.STRIPE_HOBBY_PRODUCT_ID) {
    plan = 'hobby';
  } else if (profile.productId === env.STRIPE_PRO_PRODUCT_ID) {
    plan = 'pro';
  }

  return (
    <SubscriptionProvider
      isSubscribed={Boolean(profile.subscriptionId)}
      plan={plan}
    >
      <PostHogIdentifyProvider>
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </PostHogIdentifyProvider>
    </SubscriptionProvider>
  );
};

export default AuthenticatedLayout;
