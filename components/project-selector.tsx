"use client";

import Fuse from "fuse.js";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEventHandler,
  Fragment,
  useCallback,
  useMemo,
  useState,
} from "react";
import { createProjectAction } from "@/app/actions/project/create";
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
} from "@/components/kibo-ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { handleError } from "@/lib/error/handle";
import { cn } from "@/lib/utils";
import type { projects as projectsTable } from "@/schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type ProjectSelectorProps = {
  projects: (typeof projectsTable.$inferSelect)[];
  currentProject: string;
};

export const ProjectSelector = ({
  projects,
  currentProject,
}: ProjectSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentProject);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();
  const user = useUser();

  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ["name"],
        minMatchCharLength: 1,
        threshold: 0.3,
      }),
    [projects]
  );

  const handleCreateProject = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();

      if (isCreating) {
        return;
      }

      setIsCreating(true);

      try {
        const response = await createProjectAction(name.trim());

        if ("error" in response) {
          throw new Error(response.error);
        }

        setOpen(false);
        setName("");
        router.push(`/projects/${response.id}`);
      } catch (error) {
        handleError("Error creating project", error);
      } finally {
        setIsCreating(false);
      }
    },
    [isCreating, name, router]
  );

  const handleSelect = useCallback(
    (projectId: string) => {
      if (projectId === "new") {
        setCreateOpen(true);
        return;
      }

      setValue(projectId);
      setOpen(false);
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  const projectGroups = useMemo(() => {
    if (!user) {
      return [];
    }

    return [
      {
        label: "My Projects",
        data: projects.filter((project) => project.userId === user.id),
      },
      {
        label: "Other Projects",
        data: projects.filter((project) => project.userId !== user.id),
      },
    ];
  }, [projects, user]);

  const filterByFuse = useCallback(
    (currentValue: string, search: string) =>
      fuse.search(search).find((result) => result.item.id === currentValue)
        ? 1
        : 0,
    [fuse]
  );

  return (
    <>
      <Combobox
        data={projects.map((project) => ({
          label: project.name,
          value: project.id,
        }))}
        onOpenChange={setOpen}
        onValueChange={handleSelect}
        open={open}
        type="project"
        value={value}
      >
        <ComboboxTrigger className="w-[200px] rounded-full border-none bg-transparent shadow-none" />
        <ComboboxContent
          className="p-0"
          filter={filterByFuse}
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
                            "ml-auto",
                            value === project.id ? "opacity-100" : "opacity-0"
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
      <Dialog modal={false} onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              What would you like to call your new project?
            </DialogDescription>
            <form
              aria-disabled={isCreating}
              className="mt-2 flex items-center gap-2"
              onSubmit={handleCreateProject}
            >
              <Input
                onChange={({ target }) => setName(target.value)}
                placeholder="My new project"
                value={name}
              />
              <Button disabled={isCreating || !name.trim()} type="submit">
                Create
              </Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
