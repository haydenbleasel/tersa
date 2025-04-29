'use server';

import { database } from '@/lib/database';
import { transcriptionModels } from '@/lib/models';
import { getSubscribedUser } from '@/lib/protect';
import { projects } from '@/schema';
import { experimental_transcribe as transcribe } from 'ai';
import { eq } from 'drizzle-orm';

export const transcribeAction = async (
  url: string,
  projectId: string
): Promise<
  | {
      transcript: string;
    }
  | {
      error: string;
    }
> => {
  try {
    await getSubscribedUser();

    const project = await database
      .select({
        transcriptionModel: projects.transcriptionModel,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project?.length) {
      throw new Error('Project not found');
    }

    const model = transcriptionModels
      .flatMap((model) => model.models)
      .find((model) => model.id === project[0].transcriptionModel);

    if (!model) {
      throw new Error('Model not found');
    }

    const transcript = await transcribe({
      model: model.model,
      audio: new URL(url),
    });

    return {
      transcript: transcript.text,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
