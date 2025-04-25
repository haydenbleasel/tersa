'use server';

import { database } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { and, eq } from 'drizzle-orm';

export const deleteProjectAction = async (
  projectId: number
): Promise<
  | {
      sucess: true;
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
      .delete(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.userId, data.user.id))
      );

    if (!project) {
      throw new Error('Project not found');
    }

    return { sucess: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message };
  }
};
