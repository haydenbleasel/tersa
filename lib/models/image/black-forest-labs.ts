import { env } from '@/lib/env';
import type { paths } from '@/openapi/bfl';
import type { ImageModel } from 'ai';
import createFetchClient from 'openapi-fetch';

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
  'flux-pro-1.1-ultra',
  'flux-pro-1.0-fill',
  'flux-pro-1.0-expand',
  'flux-pro-1.0-canny',
  'flux-pro-1.0-depth',
  'flux-kontext-pro',
  'flux-kontext-max',
] as const;

export const blackForestLabs = {
  image: (modelId: (typeof models)[number]): ImageModel => ({
    modelId,
    provider: 'black-forest-labs',
    specificationVersion: 'v1',
    maxImagesPerCall: 1,
    doGenerate: async ({
      aspectRatio,
      // n,
      prompt,
      providerOptions,
      seed,
      size,
      abortSignal,
      headers,
    }) => {
      const client = createClient();

      let width = 1024;
      let height = 1024;

      if (size) {
        const [w, h] = size.split('x').map(Number);
        width = w;
        height = h;
      } else if (aspectRatio) {
        const [w, h] = aspectRatio.split('x').map(Number);
        const ratio = w / h;

        // Convert to smallest possible aspect ratio
        const gcd = (a: number, b: number): number =>
          b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(w, h);
        const simplifiedW = w / divisor;
        const simplifiedH = h / divisor;

        // Check if simplified ratio is within bounds
        if (simplifiedW > 21 || simplifiedH > 21) {
          throw new Error('Aspect ratio must be between 21:9 and 9:21');
        }

        if (ratio > 1) {
          width = 1024;
          height = Math.round(1024 / ratio);
        } else {
          height = 1024;
          width = Math.round(1024 * ratio);
        }
      }

      let imagePrompt: string | undefined;

      if (typeof providerOptions?.bfl?.image === 'string') {
        imagePrompt = providerOptions.bfl.image;
      }

      const jobResponse = await client.POST(`/v1/${modelId}`, {
        body: {
          prompt,
          width,
          height,
          seed,
          aspect_ratio: `${width}:${height}`,
          safety_tolerance: 2,
          output_format: 'png',
          prompt_upsampling: false,
          image_prompt: imagePrompt,
          preprocessed_image: imagePrompt,
          input_image: imagePrompt,
        },
        signal: abortSignal,
        headers,
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
