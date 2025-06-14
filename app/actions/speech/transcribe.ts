'use server';

import { getSubscribedUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { transcriptionModels } from '@/lib/models/transcription';
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

    const project = await database.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const model = transcriptionModels[project.transcriptionModel];

    if (!model) {
      throw new Error('Model not found');
    }

    const provider = model.providers[0];
    const transcript = await transcribe({
      model: provider.model,
      audio: new URL(url),
    });

    return {
      transcript: transcript.text,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
