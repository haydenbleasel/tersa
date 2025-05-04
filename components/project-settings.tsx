import { deleteProjectAction } from '@/app/actions/project/delete';
import { updateProjectAction } from '@/app/actions/project/update';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { handleError } from '@/lib/error/handle';
import { transcriptionModels, visionModels } from '@/lib/models';
import type { projects } from '@/schema';
import { SettingsIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { ModelSelector } from './nodes/model-selector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

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
  const [visionModel, setVisionModel] = useState(data.visionModel);
  const [members, setMembers] = useState(data.members ?? []);
  const router = useRouter();

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
        visionModel,
        members,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Project updated successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      handleError('Error updating project', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await deleteProjectAction(data.id);

      if ('error' in response) {
        throw new Error(response.error);
      }

      toast.success('Project deleted successfully');
      setOpen(false);
      router.push('/');
    } catch (error) {
      handleError('Error deleting project', error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <SettingsIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update your project's details.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleUpdateProject}
          className="mt-2 grid gap-4"
          aria-disabled={isUpdating}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My new project"
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transcriptionModel">Transcription model</Label>
            <ModelSelector
              id="transcriptionModel"
              value={transcriptionModel}
              options={transcriptionModels}
              width={462}
              onChange={setTranscriptionModel}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visionModel">Vision model</Label>
            <ModelSelector
              id="visionModel"
              value={visionModel}
              options={visionModels}
              onChange={setVisionModel}
              width={462}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="members">Members</Label>
            <Textarea
              id="members"
              value={members.join('\n')}
              onChange={({ target }) => setMembers(target.value.split('\n'))}
            />
            <p className="text-muted-foreground text-sm">
              Add a list of emails separated by new lines.
            </p>
          </div>
          <Button type="submit" disabled={isUpdating || !name.trim()}>
            Update
          </Button>
        </form>
        <DialogFooter className="-mx-6 mt-4 border-t px-6 pt-4 sm:justify-center">
          <Button
            variant="link"
            onClick={handleDeleteProject}
            className="flex items-center gap-2 text-destructive"
          >
            <TrashIcon size={16} />
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
