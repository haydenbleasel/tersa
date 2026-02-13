import { track as vercelTrack } from "@vercel/analytics/react";

export const useAnalytics = () => {
  const track = (
    category: string,
    object: string,
    action: string,
    metadata: Parameters<typeof vercelTrack>[1]
  ) => {
    const eventName = `${category}:${object}_${action}`;

    vercelTrack(eventName, metadata);
  };

  return { track };
};
