import { Canvas } from '@/components/canvas';
import { database } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createProjectAction } from '../actions/project/create';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Join the waitlist to get early access to Tersa.',
};

const Home = async () => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  if (!data?.user) {
    return (
      <Canvas
        projects={[]}
        data={{
          id: -1,
          name: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'test',
          transcriptionModel: 'test',
          visionModel: 'test',
          content: 'test',
          organizationId: 'test',
          image: 'test',
        }}
      />
    );
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, data.user.id));

  if (!allProjects.length) {
    const newProject = await createProjectAction('Untitled Project');

    if ('error' in newProject) {
      throw new Error(newProject.error);
    }

    return redirect(`/projects/${newProject.id}`);
  }

  redirect(`/projects/${allProjects[0].id}`);
};

export default Home;
