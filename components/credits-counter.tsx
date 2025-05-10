import { CoinsIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

type CreditsCounterProps = {
  credits: number;
};

export const CreditsCounter = ({ credits }: CreditsCounterProps) => (
  <div className="flex shrink-0 items-center gap-2 px-2 text-muted-foreground">
    <CoinsIcon size={16} />
    {credits < 0 ? (
      <p className="text-nowrap text-sm">
        {Math.abs(credits)} credits in overage
        <Button asChild size="sm" className="-my-2 -mr-3 ml-3 rounded-full">
          <Link href="/pricing">Upgrade</Link>
        </Button>
      </p>
    ) : (
      <p className="text-nowrap text-sm">{credits} credits remaining</p>
    )}
    {!credits && (
      <Button size="sm" className="-my-2 -mr-3 ml-1 rounded-full" asChild>
        <Link href="/pricing">Upgrade</Link>
      </Button>
    )}
  </div>
);
