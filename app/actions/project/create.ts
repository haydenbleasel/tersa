'use server';

import { database } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';

export const createProjectAction = async (
  name: string
): Promise<
  | {
      id: number;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('User not found');
    }

    const project = await database
      .insert(projects)
      .values({
        name,
        userId: data.user.id,
        transcriptionModel: 'gpt-4o-mini-transcribe',
        visionModel: 'gpt-4.1-nano',
      })
      .returning({ id: projects.id });

    if (!project?.length) {
      throw new Error('Failed to create project');
    }

    return { id: project[0].id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return { error: message };
  }
};
