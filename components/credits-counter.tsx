'use client';

import { getCredits } from '@/app/actions/credits/get';
import { CoinsIcon } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { Button } from './ui/button';

type CreditsCounterProps = {
  credits: number;
};

const creditsFetcher = async () => {
  const response = await getCredits();

  if ('error' in response) {
    throw new Error(response.error);
  }

  return response;
};

export const CreditsCounter = ({ credits }: CreditsCounterProps) => {
  const { data, error } = useSWR('credits', creditsFetcher, {
    revalidateOnMount: false,
    fallbackData: { credits },
  });

  if (error) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2 px-2 text-muted-foreground">
      <CoinsIcon size={16} />
      {data.credits < 0 ? (
        <p className="text-nowrap text-sm">
          {Math.abs(data.credits)} credits in overage
          <Button asChild size="sm" className="-my-2 -mr-3 ml-3 rounded-full">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </p>
      ) : (
        <p className="text-nowrap text-sm">{data.credits} credits remaining</p>
      )}
      {!data.credits && (
        <Button size="sm" className="-my-2 -mr-3 ml-1 rounded-full" asChild>
          <Link href="/pricing">Upgrade</Link>
        </Button>
      )}
    </div>
  );
};
