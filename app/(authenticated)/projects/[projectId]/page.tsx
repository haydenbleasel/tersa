import { Canvas } from '@/components/canvas';
import { TopLeft } from '@/components/top-left';
import { TopRight } from '@/components/top-right';
import { currentUser, currentUserProfile } from '@/lib/auth';
import { database } from '@/lib/database';
import { env } from '@/lib/env';
import { ProjectProvider } from '@/providers/project';
import {
  type SubscriptionContextType,
  SubscriptionProvider,
} from '@/providers/subscription';
import { projects } from '@/schema';
import { arrayContains, eq, or } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Create and share AI workflows',
};

export const maxDuration = 800; // 13 minutes

type ProjectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const Project = async ({ params }: ProjectProps) => {
  const user = await currentUser();
  const { projectId } = await params;

  if (!user) {
    return redirect('/sign-in');
  }

  const profile = await currentUserProfile();

  if (!profile) {
    return null;
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(
      or(
        eq(projects.userId, user.id),
        user.email ? arrayContains(projects.members, [user.email]) : undefined
      )
    );

  if (!allProjects.length) {
    notFound();
  }

  const project = allProjects.find((project) => project.id === projectId);

  if (!project) {
    notFound();
  }

  let plan: SubscriptionContextType['plan'];

  if (profile.subscriptionId === env.STRIPE_HOBBY_PRODUCT_ID) {
    plan = 'hobby';
  } else if (profile.subscriptionId === env.STRIPE_PRO_PRODUCT_ID) {
    plan = 'pro';
  }

  return (
    <div className="h-screen w-screen">
      <ProjectProvider data={project}>
        <SubscriptionProvider
          isSubscribed={Boolean(profile.subscriptionId)}
          plan={plan}
        >
          <Canvas data={project} />
        </SubscriptionProvider>
      </ProjectProvider>
      <Suspense fallback={null}>
        <TopLeft id={projectId} />
      </Suspense>
      <Suspense fallback={null}>
        <TopRight id={projectId} />
      </Suspense>
    </div>
  );
};

export default Project;
