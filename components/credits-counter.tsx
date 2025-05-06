import { getCredits } from '@/app/actions/credits/get';
import { handleError } from '@/lib/error/handle';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

const fetchCredits = async () => {
  const response = await getCredits();

  if ('error' in response) {
    throw new Error(response.error);
  }

  return response.credits;
};

export const CreditsCounter = () => {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchCredits()
      .then(setCredits)
      .catch((error) => handleError('Error fetching credits', error));
  }, []);

  if (credits === null) {
    return <Loader2Icon size={20} className="animate-spin" />;
  }

  return (
    <div className="flex shrink-0 items-center gap-2 px-2 text-muted-foreground">
      <CoinsIcon size={16} />
      <p className="text-nowrap text-sm">{credits} credits remaining</p>
    </div>
  );
};
