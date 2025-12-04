"use client";

import NumberFlow from "@number-flow/react";
import { CoinsIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { getCredits } from "@/app/actions/credits/get";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/providers/subscription";

const creditsFetcher = async () => {
  const response = await getCredits();

  if ("error" in response) {
    throw new Error(response.error);
  }

  return response;
};

const pluralize = (count: number) => (count === 1 ? "credit" : "credits");

export const CreditCounter = () => {
  const subscription = useSubscription();
  const { data, error } = useSWR("credits", creditsFetcher, {
    revalidateOnMount: true,
  });

  if (error) {
    return null;
  }

  if (!data) {
    return <Loader2Icon className="size-4 animate-spin" size={16} />;
  }

  const label = pluralize(Math.abs(data.credits));

  return (
    <div className="flex shrink-0 items-center gap-2 px-2 text-muted-foreground">
      <CoinsIcon size={16} />
      <NumberFlow
        className="text-nowrap text-sm"
        suffix={
          data.credits < 0 ? ` ${label} in overage` : ` ${label} remaining`
        }
        value={Math.abs(data.credits)}
      />
      {data.credits <= 0 && subscription.plan === "hobby" && (
        <Button asChild className="-my-2 -mr-3 ml-1 rounded-full" size="sm">
          <Link href="/pricing">Upgrade</Link>
        </Button>
      )}
    </div>
  );
};
