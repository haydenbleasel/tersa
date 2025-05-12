import type { videoModels } from '@/lib/models/video';
import RunwayML from '@runwayml/sdk';

type GenerateVideoProps = {
  model: (typeof videoModels)[number]['models'][number];
  prompt: string;
  image?: string;
};

const client = new RunwayML();

export const generateRunwayVideo = async ({
  model,
  prompt,
  image,
}: GenerateVideoProps) => {
  if (!image) {
    throw new Error('Runway requires at least one image');
  }

  const response = await client.imageToVideo.create({
    model: model.model as 'gen4_turbo' | 'gen3a_turbo',
    promptImage: image,
    ratio: model.model === 'gen4_turbo' ? '1280:720' : '1280:768',
    promptText: prompt,
    duration: 10,
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
        throw new Error(`Runway video didn't generate output: ${task.failure}`);
      }

      const response = await fetch(task.output[0]);
      const arrayBuffer = await response.arrayBuffer();

      return arrayBuffer;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Runway video generation timed out');
};
