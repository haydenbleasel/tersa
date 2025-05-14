import { createClient } from '@/lib/supabase/server';
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

  return children;
};

export default ProjectsLayout;
