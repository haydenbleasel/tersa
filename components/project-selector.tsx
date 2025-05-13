'use client';

import { createProjectAction } from '@/app/actions/project/create';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from '@/components/ui/kibo-ui/combobox';
import { useUser } from '@/hooks/use-user';
import { handleError } from '@/lib/error/handle';
import { cn } from '@/lib/utils';
import type { projects } from '@/schema';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEventHandler, Fragment, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

type ProjectSelectorProps = {
  projects: (typeof projects.$inferSelect)[];
  currentProject: string;
};

export const ProjectSelector = ({
  projects,
  currentProject,
}: ProjectSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentProject);
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();
  const user = useUser();

  const handleCreateProject: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await createProjectAction(name.trim());

      if ('error' in response) {
        throw new Error(response.error);
      }

      setOpen(false);
      setName('');
      router.push(`/projects/${response.id}`);
    } catch (error) {
      handleError('Error creating project', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (projectId: string) => {
    if (projectId === 'new') {
      setCreateOpen(true);
      return;
    }

    setValue(projectId);
    setOpen(false);
    router.push(`/projects/${projectId}`);
  };

  const projectGroups = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      {
        label: 'My Projects',
        data: projects.filter((project) => project.userId === user.id),
      },
      {
        label: 'Other Projects',
        data: projects.filter((project) => project.userId !== user.id),
      },
    ];
  }, [projects, user]);

  return (
    <>
      <Combobox
        open={open}
        onOpenChange={setOpen}
        data={projects.map((project) => ({
          label: project.name,
          value: project.id,
        }))}
        type="project"
        value={value}
        onValueChange={handleSelect}
      >
        <ComboboxTrigger className="w-[200px] rounded-full border-none bg-transparent shadow-none" />
        <ComboboxContent
          className="p-0"
          popoverOptions={{
            sideOffset: 8,
          }}
        >
          <ComboboxInput />
          <ComboboxList>
            <ComboboxEmpty />
            {projectGroups
              .filter((group) => group.data.length > 0)
              .map((group) => (
                <Fragment key={group.label}>
                  <ComboboxGroup heading={group.label}>
                    {group.data.map((project) => (
                      <ComboboxItem key={project.id} value={project.id}>
                        {project.name}
                        <CheckIcon
                          className={cn(
                            'ml-auto',
                            value === project.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  <ComboboxSeparator />
                </Fragment>
              ))}
            <ComboboxGroup>
              <ComboboxItem value="new">
                <PlusIcon size={16} />
                Create new project
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Dialog open={createOpen} onOpenChange={setCreateOpen} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              What would you like to call your new project?
            </DialogDescription>
            <form
              onSubmit={handleCreateProject}
              className="mt-2 flex items-center gap-2"
              aria-disabled={isCreating}
            >
              <Input
                placeholder="My new project"
                value={name}
                onChange={({ target }) => setName(target.value)}
              />
              <Button type="submit" disabled={isCreating || !name.trim()}>
                Create
              </Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
