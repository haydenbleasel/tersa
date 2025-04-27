import { createProjectAction } from '@/app/actions/project/create';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { projects } from '@/schema';
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
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
  const router = useRouter();

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
      const message = error instanceof Error ? error.message : 'Unknown error';

      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (projectId: string) => {
    setValue(projectId);
    setOpen(false);
    router.push(`/projects/${projectId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-[200px] justify-between rounded-full border-none shadow-none"
        >
          {value
            ? projects.find((project) => project.id === value)?.name
            : 'Select project...'}
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" sideOffset={8}>
        <Command>
          <CommandInput placeholder="Search project..." className="h-9" />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={() => handleSelect(project.id)}
                >
                  {project.name}
                  <CheckIcon
                    className={cn(
                      'ml-auto',
                      value === project.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <div>
                    <CommandItem>
                      <PlusIcon size={16} />
                      Create new project
                    </CommandItem>
                  </div>
                </DialogTrigger>
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
                      <Button
                        type="submit"
                        disabled={isCreating || !name.trim()}
                      >
                        Create
                      </Button>
                    </form>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
