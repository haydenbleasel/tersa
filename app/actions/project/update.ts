'use server';

import { database } from '@/lib/database';
import { parseError } from '@/lib/error/parse';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { and, eq } from 'drizzle-orm';

export const updateProjectAction = async (
  projectId: string,
  data: Partial<typeof projects.$inferInsert>
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
    const { data: userData } = await client.auth.getUser();

    if (!userData?.user) {
      throw new Error('You need to be logged in to update a project!');
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

    return { success: true };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
