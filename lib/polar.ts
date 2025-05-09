import { Polar } from '@polar-sh/sdk';
import { env } from './env';

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN as string,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

const creditValue = 0.005;

export const trackCreditUsage = async ({
  userId,
  action,
  cost,
}: {
  userId: string;
  action: string;
  cost: number;
}) => {
  await polar.events.ingest({
    events: [
      {
        name: 'credit_usage',
        externalCustomerId: userId,
        metadata: {
          action,
          credits: Math.ceil(cost / creditValue),
        },
      },
    ],
  });
};
