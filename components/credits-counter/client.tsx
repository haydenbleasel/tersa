'use client';

import { getCredits } from '@/app/actions/credits/get';
import { Button } from '@/components/ui/button';
import { CoinsIcon } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

type CreditsClientProps = {
  defaultCredits: number;
  canUpgrade: boolean;
};

const creditsFetcher = async () => {
  const response = await getCredits();

  if ('error' in response) {
    throw new Error(response.error);
  }

  return response;
};

const pluralize = (count: number) => (count === 1 ? 'credit' : 'credits');

export const CreditsClient = ({
  defaultCredits,
  canUpgrade,
}: CreditsClientProps) => {
  const { data, error } = useSWR('credits', creditsFetcher, {
    fallbackData: { credits: defaultCredits },
  });

  if (error) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2 px-2 text-muted-foreground">
      <CoinsIcon size={16} />
      {data.credits < 0 ? (
        <p className="text-nowrap text-sm">
          {Math.abs(data.credits)} {pluralize(Math.abs(data.credits))} in
          overage
        </p>
      ) : (
        <p className="text-nowrap text-sm">
          {data.credits} {pluralize(data.credits)} remaining
        </p>
      )}
      {data.credits <= 0 && canUpgrade && (
        <Button size="sm" className="-my-2 -mr-3 ml-1 rounded-full" asChild>
          <Link href="/pricing">Upgrade</Link>
        </Button>
      )}
    </div>
  );
};
