import type { Metadata } from "next";
import { currentUser, currentUserProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { Hero } from "./components/hero";

export const metadata: Metadata = {
  title: "Tersa | Pricing",
  description: "Choose a plan to get access to all features.",
};

const PricingPage = async () => {
  const user = await currentUser();
  let currentPlan: "hobby" | "pro" | undefined;

  if (user) {
    const profile = await currentUserProfile();

    if (profile) {
      if (profile.productId === env.STRIPE_HOBBY_PRODUCT_ID) {
        currentPlan = "hobby";
      } else if (profile.productId === env.STRIPE_PRO_PRODUCT_ID) {
        currentPlan = "pro";
      }
    }
  }

  return <Hero authenticated={Boolean(user)} currentPlan={currentPlan} />;
};

export default PricingPage;
