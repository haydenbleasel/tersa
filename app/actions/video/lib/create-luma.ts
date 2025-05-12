import { env } from '@/lib/env';
import type { videoModels } from '@/lib/models/video';
import { LumaAI } from 'lumaai';

const luma = new LumaAI({
  authToken: env.LUMAAI_API_KEY,
});

type GenerateVideoProps = {
  model: (typeof videoModels)[number]['models'][number];
  prompt: string;
  image?: string;
};

export const generateLumaVideo = async ({
  model,
  prompt,
  image,
}: GenerateVideoProps) => {
  if (process.env.NODE_ENV !== 'production' && image) {
    throw new Error('Luma does not support base64 image input.');
  }

  const response = await luma.generations.video.create({
    prompt,
    model: model.model as 'ray-1-6' | 'ray-2' | 'ray-flash-2',
    duration: '9s',
    keyframes: image
      ? {
          frame0: {
            type: 'image',
            url: image,
          },
        }
      : undefined,
    resolution: model.model === 'ray-1-6' ? '720p' : '1080p',
  });

  const jobId = response.id;

  if (!jobId) {
    throw new Error("Luma didn't return a job ID");
  }

  const startTime = Date.now();
  const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  while (Date.now() - startTime < maxPollTime) {
    const generation = await luma.generations.get(jobId);

    if (generation.state === 'failed') {
      throw new Error(
        `Luma video generation failed: ${generation.failure_reason ?? 'unknown reason'}`
      );
    }

    if (generation.state === 'completed') {
      if (!generation.assets?.video) {
        throw new Error("Luma video generation didn't return a video asset");
      }

      const response = await fetch(generation.assets.video);
      const arrayBuffer = await response.arrayBuffer();

      return arrayBuffer;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Luma video generation timed out');
};
