"use server";

import { currentUserProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { parseError } from "@/lib/error/parse";
import { stripe } from "@/lib/stripe";

const HOBBY_CREDITS = 200;

export const getCredits = async (): Promise<
  | {
      credits: number;
    }
  | {
      error: string;
    }
> => {
  try {
    const profile = await currentUserProfile();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (!profile.customerId) {
      throw new Error("Customer ID not found");
    }

    if (!profile.subscriptionId) {
      throw new Error("Customer ID not found");
    }

    const upcomingInvoice = await stripe.invoices.createPreview({
      subscription: profile.subscriptionId,
    });

    const usageProductLineItem = upcomingInvoice.lines.data.find(
      (line) =>
        line.pricing?.price_details?.product === env.STRIPE_USAGE_PRODUCT_ID
    );

    if (!usageProductLineItem) {
      throw new Error("Usage product line item not found");
    }

    if (!usageProductLineItem.pricing?.price_details?.price) {
      throw new Error("Usage product line item price not found");
    }

    // Hobby plan fallback
    let credits = HOBBY_CREDITS;

    if (profile.productId !== env.STRIPE_HOBBY_PRODUCT_ID) {
      const usagePrice = await stripe.prices.retrieve(
        usageProductLineItem.pricing.price_details.price,
        { expand: ["tiers"] }
      );

      if (!usagePrice.tiers?.length) {
        throw new Error("Usage price tiers not found");
      }

      if (!usagePrice.tiers[0].up_to) {
        throw new Error("Usage price tier limit not found");
      }

      credits = usagePrice.tiers[0].up_to;
    }

    const usage = usageProductLineItem?.quantity ?? 0;

    return {
      credits: credits - usage,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
