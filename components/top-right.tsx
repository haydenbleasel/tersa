import { currentUserProfile } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Suspense } from 'react';
import { CreditsCounter } from './credits-counter';
import { Menu } from './menu';
import { Presence } from './presence';
import { Button } from './ui/button';

type TopRightProps = {
  id: string;
};

export const TopRight = async ({ id }: TopRightProps) => {
  const profile = await currentUserProfile();
  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  const project = allProjects.at(0);

  if (!profile || !project) {
    return null;
  }

  return (
    <>
      <div className="fixed top-16 right-0 left-0 z-[50] m-4 flex items-center gap-2 sm:top-0 sm:left-auto">
        {Boolean(project.members?.length) && (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1.5 drop-shadow-xs backdrop-blur-sm">
            <Presence />
          </div>
        )}
        {profile.subscriptionId ? (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-3 drop-shadow-xs backdrop-blur-sm">
            <Suspense
              fallback={
                <p className="text-muted-foreground text-sm">Loading...</p>
              }
            >
              <CreditsCounter />
            </Suspense>
          </div>
        ) : (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-0.5 drop-shadow-xs backdrop-blur-sm">
            <Button className="rounded-full" size="lg" asChild>
              <Link href="/pricing">Claim your free AI credits</Link>
            </Button>
          </div>
        )}
        <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <Menu />
        </div>
      </div>
    </>
  );
};
