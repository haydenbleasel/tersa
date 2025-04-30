import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  type DropzoneProps,
} from '@/components/ui/kibo-ui/dropzone';
import { handleError } from '@/lib/error/handle';
import { uploadFile } from '@/lib/upload';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';

type UploaderProps = {
  accept?: DropzoneProps['accept'];
  onUploadCompleted: (url: string, type: string) => void;
  className?: string;
  bucket?: 'avatars' | 'files';
  children?: ReactNode;
};

export const Uploader = ({
  onUploadCompleted,
  accept,
  className,
  bucket = 'files',
  children,
}: UploaderProps) => {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = async (files: File[]) => {
    try {
      if (!files.length) {
        throw new Error('No file selected');
      }

      setFiles(files);

      const { url, type } = await uploadFile(files[0], bucket);

      onUploadCompleted(url, type);
    } catch (error) {
      handleError('Error uploading file', error);
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
      {children ?? (
        <>
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
        </>
      )}
    </Dropzone>
  );
};
