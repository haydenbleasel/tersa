import { currentUser } from '@/lib/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Home from './(unauthenticated)/home/page';
import UnauthenticatedLayout from './(unauthenticated)/layout';

export const metadata: Metadata = {
  title: 'A visual AI playground | Tersa',
  description:
    'Tersa is an open source canvas for building AI workflows. Drag, drop connect and run nodes to build your own workflows powered by various industry-leading AI models.',
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

  redirect('/projects');
};

export default Index;
