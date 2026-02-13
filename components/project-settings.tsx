"use client";

import { SettingsIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { deleteProjectAction } from "@/app/actions/project/delete";
import { updateProjectAction } from "@/app/actions/project/update";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { handleError } from "@/lib/error/handle";
import { transcriptionModels } from "@/lib/models/transcription";
import { useSubscription } from "@/providers/subscription";
import type { projects } from "@/schema";
import { ModelSelector } from "./nodes/model-selector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type ProjectSettingsProps = {
  data: typeof projects.$inferSelect;
};

export const ProjectSettings = ({ data }: ProjectSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(data.name);
  const [transcriptionModel, setTranscriptionModel] = useState(
    data.transcriptionModel
  );
  const router = useRouter();
  const { isSubscribed } = useSubscription();

  const handleUpdateProject: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await updateProjectAction(data.id, {
        name,
        transcriptionModel,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Project updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      handleError("Error updating project", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await deleteProjectAction(data.id);

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Project deleted successfully");
      setOpen(false);
      router.push("/");
    } catch (error) {
      handleError("Error deleting project", error);
    }
  };
  return (
    <Dialog modal={false} onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="rounded-full" size="icon" variant="ghost">
          <SettingsIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update your project's details.</DialogDescription>
        </DialogHeader>
        <form
          aria-disabled={isUpdating}
          className="mt-2 grid gap-4"
          onSubmit={handleUpdateProject}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={({ target }) => setName(target.value)}
              placeholder="My new project"
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transcriptionModel">Transcription model</Label>
            <ModelSelector
              disabled={!isSubscribed}
              id="transcriptionModel"
              onChange={setTranscriptionModel}
              options={transcriptionModels}
              value={transcriptionModel}
              width={462}
            />
          </div>
          <Button disabled={isUpdating || !name.trim()} type="submit">
            Update
          </Button>
        </form>
        <DialogFooter className="-mx-6 mt-4 border-t px-6 pt-4 sm:justify-center">
          <Button
            className="flex items-center gap-2 text-destructive"
            onClick={handleDeleteProject}
            variant="link"
          >
            <TrashIcon size={16} />
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
