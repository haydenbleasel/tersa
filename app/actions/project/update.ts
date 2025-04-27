'use server';

import { database } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { and, eq } from 'drizzle-orm';

export const updateProjectAction = async (
  projectId: string,
  data: Partial<typeof projects.$inferInsert>
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
    const { data: userData } = await client.auth.getUser();

    if (!userData?.user) {
      throw new Error('User not found');
    }

    const project = await database
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(eq(projects.id, projectId), eq(projects.userId, userData.user.id))
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
