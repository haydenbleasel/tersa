import Replicate from 'replicate';
import type { VideoModel } from '.';

type KlingModel =
  | 'kwaivgi/kling-v1.5-standard'
  | 'kwaivgi/kling-v1.5-pro'
  | 'kwaivgi/kling-v1.6-standard'
  | 'kwaivgi/kling-v1.6-pro'
  | 'kwaivgi/kling-v2.0';

export const replicate: Record<string, (modelId: KlingModel) => VideoModel> = {
  kling: (modelId: KlingModel) => ({
    modelId,
    generate: async ({ prompt, imagePrompt, duration, aspectRatio }) => {
      const replicate = new Replicate();

      const output = await replicate.run(modelId, {
        input: {
          prompt,
          duration,
          start_image: imagePrompt,
          aspect_ratio: aspectRatio,
        },
      });

      if (!('url' in output) || typeof output.url !== 'function') {
        throw new Error('No output');
      }

      return output.url() as string;
    },
  }),
};
