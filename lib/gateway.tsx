import { createGateway } from '@ai-sdk/gateway';
import { env } from './env';

export const gateway = createGateway({
  apiKey: env.AI_GATEWAY_API_KEY,
});
