import { describeAction } from '@/app/actions/image/describe';
import { NodeLayout } from '@/components/nodes/layout';
import { DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { DropzoneContent } from '@/components/ui/kibo-ui/dropzone';
import { Dropzone } from '@/components/ui/kibo-ui/dropzone';
import { handleError } from '@/lib/error/handle';
import { uploadFile } from '@/lib/upload';
import { useReactFlow } from '@xyflow/react';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import type { ImageNodeProps } from '.';

type ImagePrimitiveProps = ImageNodeProps & {
  title: string;
};

export const ImagePrimitive = ({
  data,
  id,
  type,
  title,
}: ImagePrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const { projectId } = useParams();
  const [files, setFiles] = useState<File[] | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (files: File[]) => {
    if (isUploading) {
      return;
    }

    try {
      if (!files.length) {
        throw new Error('No file selected');
      }

      setIsUploading(true);
      setFiles(files);
      const [file] = files;
      const { url, type } = await uploadFile(file, 'files');

      updateNodeData(id, {
        content: {
          url,
          type,
        },
      });

      const description = await describeAction(url, projectId as string);

      if ('error' in description) {
        throw new Error(description.error);
      }

      updateNodeData(id, {
        description: description.description,
      });
    } catch (error) {
      handleError('Error uploading image', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      {data.content ? (
        <Image
          src={data.content.url}
          alt="Image"
          width={data.width ?? 1000}
          height={data.height ?? 1000}
          className="h-auto w-full rounded-lg"
        />
      ) : (
        <Dropzone
          maxSize={1024 * 1024 * 10}
          minSize={1024}
          maxFiles={1}
          multiple={false}
          accept={{
            'image/*': [],
          }}
          onDrop={handleDrop}
          src={files}
          onError={console.error}
          className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
        >
          <DropzoneEmptyState className="p-4" />
          <DropzoneContent>
            {files && files.length > 0 && (
              <div className="relative size-full">
                <Image
                  src={URL.createObjectURL(files[0])}
                  alt="Image preview"
                  className="absolute top-0 left-0 h-full w-full rounded-lg object-cover"
                  unoptimized
                  width={data.width ?? 1000}
                  height={data.height ?? 1000}
                />
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50">
                  <Loader2Icon className="size-12 animate-spin text-white" />
                </div>
              </div>
            )}
          </DropzoneContent>
        </Dropzone>
      )}
    </NodeLayout>
  );
};
