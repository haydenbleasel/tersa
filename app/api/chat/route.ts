import { parseError } from '@/lib/error/parse';
import { chatModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { createRateLimiter, slidingWindow } from '@/lib/rate-limit';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create a rate limiter for the chat API
const rateLimiter = createRateLimiter({
  limiter: slidingWindow(10, '1 m'),
  prefix: 'api-chat',
});

export const POST = async (req: Request) => {
  try {
    await getSubscribedUser();
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 401 });
  }

  // Apply rate limiting
  if (process.env.NODE_ENV === 'production') {
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

  const { messages, modelId } = await req.json();

  if (typeof modelId !== 'string') {
    return new Response('Model must be a string', { status: 400 });
  }

  const model = chatModels
    .flatMap((m) => m.models)
    .find((m) => m.id === modelId);

  if (!model) {
    return new Response('Invalid model', { status: 400 });
  }

  const result = streamText({
    model: model.model,
    system: [
      "You are a helpful assistant that synthesizes content based on the user's prompts.",
      'The user will provide instructions; and may provide text, audio transcriptions, or images (and their descriptions) as context.',
      "You will then synthesize the content based on the user's instructions and the context provided.",
      'The output should be a concise summary of the content, no more than 100 words.',
    ].join('\n'),
    messages,
  });

  return result.toDataStreamResponse();
};
