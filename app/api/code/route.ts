import { parseError } from '@/lib/error/parse';
import { chatModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { createRateLimiter, slidingWindow } from '@/lib/rate-limit';
import { streamObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create a rate limiter for the chat API
const rateLimiter = createRateLimiter({
  limiter: slidingWindow(10, '1 m'),
  prefix: 'api-code',
});

export const POST = async (req: Request) => {
  try {
    await getSubscribedUser();
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 401 });
  }

  if (process.env.NODE_ENV === 'production') {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      return new Response('Too many requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  const context = await req.json();
  const modelId = req.headers.get('tersa-model');
  const language = req.headers.get('tersa-language');

  if (!modelId) {
    return new Response('Model not found', { status: 400 });
  }

  const model = chatModels
    .flatMap((model) => model.models)
    .find(({ id }) => id === modelId)?.model;

  if (!model) {
    return new Response('Model not found', { status: 400 });
  }

  const result = streamObject({
    model: model,
    schema: z.object({
      text: z.string(),
      language: z.string(),
    }),
    prompt: [
      '------ System ------',
      `Output the code in the language specified: ${language ?? 'javascript'}`,
      'If the user specifies an output language in the context below, ignore it.',
      'Respond with the code only, no other text.',
      '------ User ------',
      context,
    ].join('\n'),
  });

  return result.toTextStreamResponse();
};
