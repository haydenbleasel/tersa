import { chatModels } from '@/lib/models';
import { streamObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (req: Request) => {
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
      '------ User ------',
      context,
    ].join('\n'),
  });

  return result.toTextStreamResponse();
};
