import { Canvas } from '@/components/canvas';
import { TopLeft } from '@/components/top-left';
import { TopRight } from '@/components/top-right';
import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { ReactFlowProvider } from '@xyflow/react';
import { eq } from 'drizzle-orm';
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

  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id));

  if (!allProjects.length) {
    notFound();
  }

  const project = allProjects.find((project) => project.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Canvas data={project} />
        <Suspense fallback={null}>
          <TopLeft id={projectId} />
        </Suspense>
        <Suspense fallback={null}>
          <TopRight id={projectId} />
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
};

export default Project;
