import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { currentUser, currentUserProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { GatewayProvider } from "@/providers/gateway";
import { PostHogIdentifyProvider } from "@/providers/posthog-provider";
import {
  type SubscriptionContextType,
  SubscriptionProvider,
} from "@/providers/subscription";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

const AuthenticatedLayout = async ({ children }: AuthenticatedLayoutProps) => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await currentUserProfile();

  if (!profile) {
    return null;
  }

  const plan: SubscriptionContextType["plan"] =
    profile.productId === env.STRIPE_PRO_PRODUCT_ID ? "pro" : undefined;

  return (
    <SubscriptionProvider
      isSubscribed={Boolean(profile.subscriptionId)}
      plan={plan}
    >
      <GatewayProvider>
        <PostHogIdentifyProvider>
          <ReactFlowProvider>{children}</ReactFlowProvider>
        </PostHogIdentifyProvider>
      </GatewayProvider>
    </SubscriptionProvider>
  );
};

export default AuthenticatedLayout;
