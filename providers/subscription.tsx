'use client';

import { type ReactNode, createContext, useContext } from 'react';

export type SubscriptionContextType = {
  isSubscribed: boolean;
  plan: 'hobby' | 'pro' | 'enterprise' | undefined;
};

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  plan: undefined,
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }

  return context;
};

export const SubscriptionProvider = ({
  children,
  isSubscribed,
  plan,
}: {
  children: ReactNode;
  isSubscribed: boolean;
  plan: 'hobby' | 'pro' | 'enterprise' | undefined;
}) => (
  <SubscriptionContext.Provider value={{ isSubscribed, plan }}>
    {children}
  </SubscriptionContext.Provider>
);
