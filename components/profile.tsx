import type { UserAttributes } from "@supabase/supabase-js";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { type FormEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleError } from "@/lib/error/handle";
import { createClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/upload";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "./ui/kibo-ui/dropzone";
import { Label } from "./ui/label";

type ProfileProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Profile = ({ open, setOpen }: ProfileProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [password, setPassword] = useState("");

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

    if (!(name.trim() && email.trim()) || isUpdating) {
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

      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (error) {
      handleError("Error updating profile", error);
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
        throw new Error("No file selected");
      }

      setIsUpdating(true);

      const { url } = await uploadFile(files[0], "avatars");
      const client = createClient();

      const response = await client.auth.updateUser({
        data: {
          avatar: url,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Avatar updated successfully");
      setImage(url);
    } catch (error) {
      handleError("Error updating avatar", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog modal={false} onOpenChange={setOpen} open={open}>
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
            accept={{ "image/*": [] }}
            className="relative aspect-square h-36 w-auto"
            maxFiles={1}
            maxSize={1024 * 1024 * 10}
            minSize={1024}
            multiple={false}
            onDrop={handleDrop}
            onError={console.error}
            src={[new File([], image)]}
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {image ? (
                <Image
                  alt="Image preview"
                  className="absolute top-0 left-0 h-full w-full object-cover"
                  height={100}
                  src={image}
                  unoptimized
                  width={100}
                />
              ) : null}
              {isUpdating ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Loader2Icon className="animate-spin" size={24} />
                </div>
              ) : null}
            </DropzoneContent>
          </Dropzone>
        </div>
        <form
          aria-disabled={isUpdating}
          className="mt-2 grid gap-4"
          onSubmit={handleUpdateUser}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              className="text-foreground"
              id="name"
              onChange={({ target }) => setName(target.value)}
              placeholder="Jane Doe"
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              className="text-foreground"
              id="email"
              onChange={({ target }) => setEmail(target.value)}
              placeholder="jane@doe.com"
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              className="text-foreground"
              id="password"
              onChange={({ target }) => setPassword(target.value)}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </div>
          <Button
            disabled={isUpdating || !name.trim() || !email.trim()}
            type="submit"
          >
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
