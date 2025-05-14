import { currentUser } from '@/lib/auth';
import { database } from '@/lib/database';
import { projects } from '@/schema';
import { eq } from 'drizzle-orm';
import { ProjectSelector } from './project-selector';
import { ProjectSettings } from './project-settings';

type TopLeftProps = {
  id: string;
};

export const TopLeft = async ({ id }: TopLeftProps) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const allProjects = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id));

  if (!allProjects.length) {
    return null;
  }

  const currentProject = allProjects.find((project) => project.id === id);

  if (!currentProject) {
    return null;
  }

  return (
    <div className="fixed top-16 right-0 left-0 z-[50] m-4 flex items-center gap-2 sm:top-0 sm:right-auto">
      <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
        <ProjectSelector
          projects={allProjects}
          currentProject={currentProject.id}
        />
      </div>
      {user.id === currentProject.userId && (
        <div className="flex shrink-0 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <ProjectSettings data={currentProject} />
        </div>
      )}
    </div>
  );
};
