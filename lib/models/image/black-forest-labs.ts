import { env } from '@/lib/env';
import type { paths } from '@/openapi/bfl';
import type { ImageModel } from 'ai';
import createFetchClient, { type Client } from 'openapi-fetch';

const createClient = () =>
  createFetchClient<paths>({
    baseUrl: 'https://api.us1.bfl.ai',
    headers: {
      'Content-Type': 'application/json',
      'X-Key': env.BF_API_KEY,
    },
    fetch: fetch,
  });

const models = [
  'flux-pro-1.1',
  'flux-pro',
  'flux-dev',
  'flux-pro-1.0-canny',
  'flux-pro-1.0-depth',
  'flux-kontext-pro',
  'flux-kontext-max',
] as const;

type CreateJobParams = {
  client: Client<paths>;
  modelId: (typeof models)[number];
  prompt: string;
  size: `${string}x${string}` | undefined;
  seed: number | undefined;
  abortSignal: AbortSignal | undefined;
  headers: Record<string, string | undefined> | undefined;
  imagePrompt: string | undefined;
};

const createJob = async ({
  client,
  modelId,
  prompt,
  size,
  seed,
  abortSignal,
  headers,
  imagePrompt,
}: CreateJobParams) => {
  const [width, height] = size?.split('x').map(Number) ?? [1024, 1024];

  // Convert to smallest possible aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const simplifiedW = width / divisor;
  const simplifiedH = height / divisor;

  const ratio = width / height;

  if (ratio > 21 / 9 || ratio < 9 / 21) {
    throw new Error('Aspect ratio must be between 21:9 and 9:21');
  }

  switch (modelId) {
    case 'flux-dev':
      return await client.POST('/v1/flux-dev', {
        body: {
          prompt,
          width,
          height,
          seed,
          steps: 28,
          prompt_upsampling: true,
          guidance: 3,
          safety_tolerance: 2,
          output_format: 'png',
          image_prompt: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-pro-1.1':
      return await client.POST('/v1/flux-pro-1.1', {
        body: {
          prompt,
          width,
          height,
          seed,
          prompt_upsampling: true,
          safety_tolerance: 2,
          output_format: 'png',
          image_prompt: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-pro':
      return await client.POST('/v1/flux-pro', {
        body: {
          prompt,
          width,
          height,
          seed,
          steps: 40,
          prompt_upsampling: true,
          guidance: 2.5,
          safety_tolerance: 2,
          output_format: 'png',
          image_prompt: imagePrompt,
          interval: 2,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-pro-1.0-canny':
      return await client.POST('/v1/flux-pro-1.0-canny', {
        body: {
          prompt,
          canny_low_threshold: 50,
          canny_high_threshold: 200,
          prompt_upsampling: true,
          seed,
          steps: 50,
          guidance: 30,
          safety_tolerance: 2,
          output_format: 'png',
          preprocessed_image: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-pro-1.0-depth':
      return await client.POST('/v1/flux-pro-1.0-depth', {
        body: {
          prompt,
          prompt_upsampling: true,
          seed,
          steps: 50,
          guidance: 15,
          safety_tolerance: 2,
          output_format: 'png',
          preprocessed_image: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-kontext-pro':
      return await client.POST('/v1/flux-kontext-pro', {
        body: {
          prompt,
          prompt_upsampling: true,
          seed,
          aspect_ratio: `${simplifiedW}:${simplifiedH}`,
          output_format: 'png',
          safety_tolerance: 2,
          input_image: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    case 'flux-kontext-max':
      return await client.POST('/v1/flux-kontext-max', {
        body: {
          prompt,
          prompt_upsampling: true,
          seed,
          aspect_ratio: `${simplifiedW}:${simplifiedH}`,
          output_format: 'png',
          safety_tolerance: 2,
          input_image: imagePrompt,
        },
        signal: abortSignal,
        headers,
      });
    default:
      throw new Error(`Model ${modelId} not supported`);
  }
};

export const blackForestLabs = {
  image: (modelId: (typeof models)[number]): ImageModel => ({
    modelId,
    provider: 'black-forest-labs',
    specificationVersion: 'v1',
    maxImagesPerCall: 1,
    doGenerate: async ({
      prompt,
      providerOptions,
      seed,
      size,
      abortSignal,
      headers,
    }) => {
      const client = createClient();

      let imagePrompt: string | undefined;

      if (typeof providerOptions?.bfl?.image === 'string') {
        imagePrompt = providerOptions.bfl.image;
      }

      const jobResponse = await createJob({
        client,
        modelId,
        prompt,
        size,
        seed,
        abortSignal,
        headers,
        imagePrompt,
      });

      if (jobResponse.error) {
        throw new Error(
          jobResponse.error.detail?.at(0)?.msg ?? 'Unknown error'
        );
      }

      if (!jobResponse.data?.id) {
        throw new Error('Failed to get job ID');
      }

      // Poll for job completion (max 2 minutes)
      let isCompleted = false;
      const startTime = Date.now();
      const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

      while (!isCompleted && Date.now() - startTime < maxPollTime) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const queryJobResponse = await client.GET('/v1/get_result', {
          params: {
            query: {
              id: jobResponse.data.id,
            },
          },
        });

        if (queryJobResponse.error) {
          throw new Error(
            queryJobResponse.error.detail?.at(0)?.msg ?? 'Unknown error'
          );
        }

        if (queryJobResponse.data?.status === 'Error') {
          throw new Error(`Job ${jobResponse.data.id} failed`);
        }

        if (queryJobResponse.data?.status === 'Content Moderated') {
          throw new Error('Content moderated');
        }

        if (queryJobResponse.data?.status === 'Task not found') {
          throw new Error(`${jobResponse.data.id} not found`);
        }

        if (queryJobResponse.data?.status === 'Request Moderated') {
          throw new Error('Request moderated');
        }

        if (queryJobResponse.data?.status === 'Ready') {
          isCompleted = true;

          const result = queryJobResponse.data.result as {
            sample: string;
          };

          const image = await fetch(result.sample);
          const imageBuffer = await image.arrayBuffer();

          return {
            images: [new Uint8Array(imageBuffer)],
            warnings: [],
            response: {
              timestamp: new Date(),
              modelId,
              headers: undefined,
            },
          };
        }
      }

      throw new Error('Image generation timed out after 5 minutes');
    },
  }),
};
