'use client';

import { createCheckoutLink } from '@/app/actions/checkout/create';
import { handleError } from '@/lib/error/handle';
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed';
import { Loader2Icon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import { Button } from './ui/button';

export const ClaimButton = () => {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState<string>('');
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    const response = await createCheckoutLink();

    if ('error' in response) {
      handleError('Error creating checkout link', response.error);
      setLoading(false);
      return;
    }

    setCheckoutLink(response.url);
    PolarEmbedCheckout.init();

    setTimeout(() => {
      ref.current?.click();
    }, 50);

    setLoading(false);
  };

  return (
    <>
      <Button
        className="rounded-full"
        size="lg"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          'Claim your free AI credits'
        )}
      </Button>
      <a
        href={checkoutLink}
        data-polar-checkout
        data-polar-checkout-theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        ref={ref}
        className="hidden"
      >
        Claim your free AI credits
      </a>
    </>
  );
};
