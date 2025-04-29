import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  type DropzoneProps,
} from '@/components/ui/kibo-ui/dropzone';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

type UploaderProps = {
  accept?: DropzoneProps['accept'];
  onUploadCompleted: (url: string, type: string) => void;
  className?: string;
  bucket?: 'avatars' | 'files';
};

export const Uploader = ({
  onUploadCompleted,
  accept,
  className,
  bucket = 'files',
}: UploaderProps) => {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = async (files: File[]) => {
    try {
      if (!files.length) {
        throw new Error('No file selected');
      }

      const client = createClient();
      const { data } = await client.auth.getUser();

      if (!data?.user) {
        throw new Error('You need to be logged in to upload a file!');
      }

      setFiles(files);

      const file = files[0];
      const extension = file.name.split('.').pop();

      const blob = await client.storage
        .from(bucket)
        .upload(`${data.user.id}/${nanoid()}.${extension}`, file, {
          contentType: file.type,
        });

      if (blob.error) {
        throw new Error(blob.error.message);
      }

      const { data: downloadUrl } = client.storage
        .from(bucket)
        .getPublicUrl(blob.data.path);

      onUploadCompleted(downloadUrl.publicUrl, file.type);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      toast.error(message);
    }
  };

  return (
    <Dropzone
      maxSize={1024 * 1024 * 10}
      minSize={1024}
      maxFiles={1}
      multiple={false}
      accept={accept}
      onDrop={handleDrop}
      src={files}
      onError={console.error}
      className={className}
    >
      <DropzoneEmptyState />
      <DropzoneContent>
        {files && files.length > 0 && (
          <div className="h-[102px] w-full">
            <Image
              src={URL.createObjectURL(files[0])}
              alt="Image preview"
              className="absolute top-0 left-0 h-full w-full object-cover"
              unoptimized
              width={100}
              height={100}
            />
          </div>
        )}
      </DropzoneContent>
    </Dropzone>
  );
};
