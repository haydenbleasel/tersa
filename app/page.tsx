import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Home from './(unauthenticated)/home/page';
import UnauthenticatedLayout from './(unauthenticated)/layout';
import { createProjectAction } from './actions/project/create';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Visualize your AI workflows.',
};

const Index = async () => {
  const user = await currentUser();

  if (!user) {
    return (
      <UnauthenticatedLayout>
        <Home />
      </UnauthenticatedLayout>
    );
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id));

  if (!allProjects.length) {
    const newProject = await createProjectAction('Untitled Project');

    if ('error' in newProject) {
      throw new Error(newProject.error);
    }

    return redirect(`/projects/${newProject.id}`);
  }

  redirect(`/projects/${allProjects[0].id}`);
};

export default Index;
