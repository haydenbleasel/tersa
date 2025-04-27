'use server';

import { database } from '@/lib/database';
import { transcriptionModels } from '@/lib/models';
import { createClient } from '@/lib/supabase/server';
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
    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('Create an account to use AI features.');
    }

    if (data.user.user_metadata.isBanned) {
      throw new Error('You are banned from using AI features.');
    }

    if (!data.user.user_metadata.stripeSubscriptionId) {
      throw new Error('Please upgrade to a paid plan to use AI features.');
    }

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
