'use client';

import { useUser } from '@/hooks/use-user';
import { env } from '@/lib/env';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { type ReactNode, Suspense, useEffect } from 'react';

type PostHogProviderProps = {
  children: ReactNode;
};

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
      // debug: process.env.NODE_ENV === 'development',
      debug: false,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
};

const PostHogPageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += `?${search}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
};

const SuspendedPostHogPageView = () => {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
};

export const PostHogIdentifyProvider = ({ children }: PostHogProviderProps) => {
  const posthog = usePostHog();
  const user = useUser();

  useEffect(() => {
    if (posthog && user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata.name,
      });
    }
  }, [posthog, user]);

  return children;
};
