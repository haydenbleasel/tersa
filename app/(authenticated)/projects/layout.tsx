import { createClient } from '@/lib/supabase/server';
import { PostHogIdentifyProvider } from '@/providers/posthog-provider';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

type ProjectsLayoutProps = {
  children: ReactNode;
};

const ProjectsLayout = async ({ children }: ProjectsLayoutProps) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/auth/login');
  }

  return <PostHogIdentifyProvider>{children}</PostHogIdentifyProvider>;
};

export default ProjectsLayout;
