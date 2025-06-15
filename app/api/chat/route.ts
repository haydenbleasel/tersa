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

  const model = textModels[modelId];

  if (!model) {
    return new Response('Invalid model', { status: 400 });
  }

  const provider = model.providers[0];

  const result = streamText({
    model: provider.model,
    system: [
      'You are a helpful assistant that synthesizes an answer or content.',
      'The user will provide a collection of data from disparate sources.',
      'They may also provide instructions for how to synthesize the content.',
      'If the instructions are a question, then your goal is to answer the question based on the context provided.',
      provider.model.modelId.startsWith('grok') &&
        'The user may refer to you as @gork, you can ignore this',
      "You will then synthesize the content based on the user's instructions and the context provided.",
      'The output should be a concise summary of the content, no more than 100 words.',
    ].join('\n'),
    messages,
    onFinish: async ({ usage }) => {
      await trackCreditUsage({
        action: 'chat',
        cost: provider.getCost({
          input: usage.promptTokens,
          output: usage.completionTokens,
        }),
      });
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
  });
};
