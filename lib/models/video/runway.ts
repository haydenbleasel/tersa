import { env } from '@/lib/env';
import type { VideoModel } from '@/lib/models/video';
import RunwayML from '@runwayml/sdk';

export const runway = (modelId: 'gen4_turbo' | 'gen3a_turbo'): VideoModel => ({
  modelId,
  generate: async ({ prompt, imagePrompt, duration }) => {
    if (!imagePrompt) {
      throw new Error('Runway requires at least one image');
    }

    const client = new RunwayML({ apiKey: env.RUNWAYML_API_SECRET });

    const response = await client.imageToVideo.create({
      model: modelId,
      promptImage: imagePrompt,
      ratio: modelId === 'gen4_turbo' ? '1280:720' : '1280:768',
      promptText: prompt,
      duration,
    });

    const startTime = Date.now();
    const maxPollTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    while (Date.now() - startTime < maxPollTime) {
      const task = await client.tasks.retrieve(response.id);

      if (task.status === 'CANCELLED' || task.status === 'FAILED') {
        throw new Error(`Runway video generation failed: ${task.failure}`);
      }

      if (task.status === 'SUCCEEDED') {
        if (!task.output?.length) {
          throw new Error(
            `Runway video didn't generate output: ${task.failure}`
          );
        }

        const url = task.output.at(0);

        if (!url) {
          throw new Error('Runway video generation failed: No output URL');
        }

        return url;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Runway video generation timed out');
  },
});
