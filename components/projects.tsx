import { useUser } from '@/hooks/use-user';
import type { projects } from '@/schema';
import { Panel } from '@xyflow/react';
import { ProjectSelector } from './project-selector';
import { ProjectSettings } from './project-settings';

type ProjectsProps = {
  projects: (typeof projects.$inferSelect)[];
  currentProject: string;
};

export const Projects = ({ projects, currentProject }: ProjectsProps) => {
  const user = useUser();

  const currentProjectData = projects.find(
    (project) => project.id === currentProject
  );

  if (!currentProjectData) {
    return null;
  }

  return (
    <Panel
      position="top-left"
      className="top-16! right-0 flex items-center gap-2 sm:top-0! sm:right-auto"
    >
      <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
        <ProjectSelector projects={projects} currentProject={currentProject} />
      </div>
      {user?.id === currentProjectData.userId && (
        <div className="flex shrink-0 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <ProjectSettings data={currentProjectData} />
        </div>
      )}
    </Panel>
  );
};
