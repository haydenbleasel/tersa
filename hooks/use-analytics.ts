import { track as vercelTrack } from '@vercel/analytics/react';
import { usePostHog } from 'posthog-js/react';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const track = (
    category: string,
    object: string,
    action: string,
    metadata: Parameters<typeof vercelTrack>[1]
  ) => {
    // https://posthog.com/docs/product-analytics/best-practices#suggested-naming-guide
    const eventName = `${category}:${object}_${action}`;

    posthog.capture(eventName, metadata);
    vercelTrack(eventName, metadata);
  };

  return { track };
};
