import { getSubscribedUser } from '@/lib/auth';
import { parseError } from '@/lib/error/parse';
import { textModels } from '@/lib/models/text';
import { createRateLimiter, slidingWindow } from '@/lib/rate-limit';
import { trackCreditUsage } from '@/lib/stripe';
import { streamText } from 'ai';

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

  const { messages, modelId, language } = await req.json();

  if (typeof modelId !== 'string') {
    return new Response('Model must be a string', { status: 400 });
  }

  const model = textModels[modelId];

  if (!model) {
    return new Response('Invalid model', { status: 400 });
  }

  const provider = model.providers[0];

  const result = streamText({
    model: provider.model,
    system: [
      `Output the code in the language specified: ${language ?? 'javascript'}`,
      'If the user specifies an output language in the context below, ignore it.',
      'Respond with the code only, no other text.',
      'Do not format the code as Markdown, just return the code as is.',
    ].join('\n'),
    messages,
    onError: (error) => {
      console.error(error);
    },
    onFinish: async ({ usage }) => {
      await trackCreditUsage({
        action: 'code',
        cost: provider.getCost({
          input: usage.promptTokens,
          output: usage.completionTokens,
        }),
      });
    },
  });

  return result.toDataStreamResponse();
};
