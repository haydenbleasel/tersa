"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { type ReactNode, Suspense, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { env } from "@/lib/env";

type PostHogProviderProps = {
  children: ReactNode;
};

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
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
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += `?${search}`;
      }
      posthogClient.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
};

const SuspendedPostHogPageView = () => (
  <Suspense fallback={null}>
    <PostHogPageView />
  </Suspense>
);

export const PostHogIdentifyProvider = ({ children }: PostHogProviderProps) => {
  const posthogClient = usePostHog();
  const user = useUser();

  useEffect(() => {
    if (posthogClient && user) {
      posthogClient.identify(user.id, {
        email: user.email,
        name: user.user_metadata.name,
      });
    }
  }, [posthogClient, user]);

  return children;
};
