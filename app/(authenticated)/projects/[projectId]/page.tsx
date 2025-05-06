import { Canvas } from '@/components/canvas';
import { database } from '@/lib/database';
import { polar } from '@/lib/polar';
import { createClient } from '@/lib/supabase/server';
import { projects } from '@/schema';
import { eq, or } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

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
  const client = await createClient();
  const { data } = await client.auth.getUser();
  const { projectId } = await params;

  if (!data?.user) {
    return redirect('/sign-in');
  }

  if (!data.user.user_metadata.polar_customer_id && data.user.email) {
    const customer = await polar.customers.create({
      email: data.user.email,
      externalId: data.user.id,
    });

    await client.auth.updateUser({
      data: {
        polar_customer_id: customer.id,
      },
    });
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(
      or(
        eq(projects.userId, data.user.id)
        // data.user.email
        //   ? arrayContains(projects.members, [data.user.email])
        //   : undefined
      )
    );

  if (!allProjects.length) {
    notFound();
  }

  const project = allProjects.find((project) => project.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="h-screen w-screen">
      <Canvas projects={allProjects} data={project} />
    </div>
  );
};

export default Project;
