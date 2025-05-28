import { createProjectAction } from '@/app/actions/project/create';
import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { profile, projects } from '@/schema';
import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WelcomeDemo } from './components/welcome-demo';

const title = 'Welcome to Tersa!';
const description =
  "Tersa is a platform for creating and sharing AI-powered projects. Let's get started by creating a flow, together.";

export const metadata: Metadata = {
  title,
  description,
};

const Welcome = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const allProfiles = await database
    .select()
    .from(profile)
    .where(eq(profile.id, user.id));
  const userProfile = allProfiles.at(0);

  const welcomeProjects = await database
    .select()
    .from(projects)
    .where(
      and(eq(projects.userId, user.id), eq(projects.welcomeProject, true))
    );
  let welcomeProject = welcomeProjects.at(0);

  if (!welcomeProject) {
    const response = await createProjectAction('Welcome', true);

    if ('error' in response) {
      return <div>Error: {response.error}</div>;
    }

    const project = await database
      .select()
      .from(projects)
      .where(eq(projects.id, response.id))
      .limit(1);

    welcomeProject = project.at(0);
  }

  if (!welcomeProject) {
    throw new Error('Failed to create welcome project');
  }

  return (
    <div className="flex flex-col gap-4">
      <WelcomeDemo
        title={title}
        description={description}
        data={welcomeProject}
        subscribed={Boolean(userProfile?.subscriptionId)}
      />
    </div>
  );
};

export default Welcome;
