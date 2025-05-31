import Replicate from 'replicate';
import type { VideoModel } from '.';

export const replicate: Record<string, VideoModel['model']> = {
  kling1p6standard: {
    modelId: 'kwaivgi/kling-v1.6-standard',
    generate: async ({ prompt, imagePrompt, duration, aspectRatio }) => {
      const replicate = new Replicate();

      const output = await replicate.run('kwaivgi/kling-v1.6-standard', {
        input: {
          prompt,
          duration,
          start_image: imagePrompt,
          aspect_ratio: aspectRatio,
        },
      });

      if (!('url' in output)) {
        throw new Error('No output');
      }

      return output.url as string;
    },
  },
};
