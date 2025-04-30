import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { handleError } from '@/lib/error/handle';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/upload';
import type { UserAttributes } from '@supabase/supabase-js';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { type FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from './ui/kibo-ui/dropzone';
import { Label } from './ui/label';

type ProfileProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Profile = ({ open, setOpen }: ProfileProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const client = createClient();
      const { data } = await client.auth.getUser();

      if (!data.user) {
        return;
      }

      if (data.user.user_metadata.name) {
        setName(data.user.user_metadata.name);
      }

      if (data.user.email) {
        setEmail(data.user.email);
      }

      if (data.user.user_metadata.avatar) {
        setImage(data.user.user_metadata.avatar);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateUser: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      const client = createClient();

      const attributes: UserAttributes = {
        data: {},
      };

      if (name.trim()) {
        attributes.data = {
          ...attributes.data,
          name,
        };
      }

      if (email.trim()) {
        attributes.email = email;
      }

      if (password.trim()) {
        attributes.password = password;
      }

      const response = await client.auth.updateUser(attributes);

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Profile updated successfully');
      setOpen(false);
    } catch (error) {
      handleError('Error updating profile', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDrop = async (files: File[]) => {
    if (isUpdating) {
      return;
    }

    try {
      if (!files.length) {
        throw new Error('No file selected');
      }

      setIsUpdating(true);

      const { url } = await uploadFile(files[0], 'avatars');
      const client = createClient();

      const response = await client.auth.updateUser({
        data: {
          avatar: url,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Avatar updated successfully');
      setImage(url);
    } catch (error) {
      handleError('Error updating avatar', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Update your profile information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="avatar">Avatar</Label>
          <Dropzone
            maxSize={1024 * 1024 * 10}
            minSize={1024}
            maxFiles={1}
            multiple={false}
            accept={{ 'image/*': [] }}
            onDrop={handleDrop}
            src={[new File([], image)]}
            onError={console.error}
            className="relative aspect-square h-36 w-auto"
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {image && (
                <Image
                  src={image}
                  alt="Image preview"
                  className="absolute top-0 left-0 h-full w-full object-cover"
                  unoptimized
                  width={100}
                  height={100}
                />
              )}
              {isUpdating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Loader2Icon size={24} className="animate-spin" />
                </div>
              )}
            </DropzoneContent>
          </Dropzone>
        </div>
        <form
          onSubmit={handleUpdateUser}
          className="mt-2 grid gap-4"
          aria-disabled={isUpdating}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={name}
              onChange={({ target }) => setName(target.value)}
              className="text-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="jane@doe.com"
              value={email}
              type="email"
              onChange={({ target }) => setEmail(target.value)}
              className="text-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              value={password}
              type="password"
              onChange={({ target }) => setPassword(target.value)}
              className="text-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={isUpdating || !name.trim() || !email.trim()}
          >
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
