'use server';

import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { projects } from '@/schema';

export const createProjectAction = async (
  name: string
): Promise<
  | {
      id: string;
    }
  | {
      error: string;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('You need to be logged in to create a project!');
    }

    const project = await database
      .insert(projects)
      .values({
        name,
        userId: user.id,
        transcriptionModel: 'gpt-4o-mini-transcribe',
        visionModel: 'gpt-4.1-nano',
      })
      .returning({ id: projects.id });

    if (!project?.length) {
      throw new Error('Failed to create project');
    }

    return { id: project[0].id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
