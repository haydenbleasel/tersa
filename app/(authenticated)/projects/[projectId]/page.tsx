import { Canvas } from '@/components/canvas';
import { RealtimeCursors } from '@/components/supabase-ui/realtime-cursors';
import { database } from '@/lib/database';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Create and share AI workflows',
};

type ProjectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const Project = async ({ params }: ProjectProps) => {
  const client = await createClient();
  const { data } = await client.auth.getUser();
  const { projectId } = await params;

  if (!data?.user) {
    return redirect('/sign-in');
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, data.user.id));

  if (!allProjects.length) {
    notFound();
  }

  const project = allProjects.find(
    (project) => project.id === Number(projectId)
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen w-screen">
      <RealtimeCursors
        roomName={project.id.toString()}
        username={data.user.user_metadata.full_name ?? data.user.email}
      />
      <Canvas projects={allProjects} data={project} userId={data.user.id} />
    </div>
  );
};

export default Project;
