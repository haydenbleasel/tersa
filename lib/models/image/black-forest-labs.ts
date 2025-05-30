import type { paths } from '@/openapi/bfl';
import type { ImageModel } from 'ai';
import createFetchClient from 'openapi-fetch';

const createClient = () =>
  createFetchClient<paths>({
    baseUrl: 'https://api.us1.bfl.ai',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.BF_API_KEY}`,
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
        if (ratio > 1) {
          width = 1024;
          height = Math.round(1024 / ratio);
        } else {
          height = 1024;
          width = Math.round(1024 * ratio);
        }
      }

      const jobResponse = await client.POST(`/v1/${modelId}`, {
        body: {
          prompt,
          width,
          height,
          seed,
          safety_tolerance: 6,
          output_format: 'png',
          prompt_upsampling: false,
        },
        signal: abortSignal,
        headers,
      });

      if (jobResponse.error) {
        throw new Error(`API error: ${jobResponse.error.detail}`);
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
          throw new Error(`API error: ${queryJobResponse.error.detail}`);
        }

        if (queryJobResponse.data?.status === 'Error') {
          throw new Error(`API error: Job ${jobResponse.data.id} failed`);
        }

        if (queryJobResponse.data?.status === 'Content Moderated') {
          throw new Error('Content moderated');
        }

        if (queryJobResponse.data?.status === 'Task not found') {
          throw new Error(`API error: Job ${jobResponse.data.id} not found`);
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
