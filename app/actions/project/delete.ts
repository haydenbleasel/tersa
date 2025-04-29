'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { and, eq } from 'drizzle-orm';

export const deleteProjectAction = async (
  projectId: string
): Promise<
  | {
      success: true;
    }
  | {
      error: string;
    }
> => {
  try {
    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data?.user) {
      throw new Error('You need to be logged in to delete a project!');
    }

    const project = await database
      .delete(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.userId, data.user.id))
      );

    if (!project) {
      throw new Error('Project not found');
    }

    return { success: true };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
