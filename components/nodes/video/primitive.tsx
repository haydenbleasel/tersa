import { NodeLayout } from '@/components/nodes/layout';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone';
import { handleError } from '@/lib/error/handle';
import { uploadFile } from '@/lib/upload';
import { useReactFlow } from '@xyflow/react';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type { VideoNodeProps } from '.';

type VideoPrimitiveProps = VideoNodeProps & {
  title: string;
};

const getVideoDimensions = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });

export const VideoPrimitive = ({
  data,
  id,
  type,
  title,
}: VideoPrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
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

      const dimensions = await getVideoDimensions(file);

      updateNodeData(id, {
        width: dimensions.width,
        height: dimensions.height,
      });

      await new Promise((resolve) => setTimeout(resolve, 50000));

      const { url, type } = await uploadFile(file, 'files');

      updateNodeData(id, {
        content: {
          url,
          type,
        },
      });
    } catch (error) {
      handleError('Error uploading video', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      {data.content ? (
        <video
          src={data.content.url}
          width={data.width ?? 1600}
          height={data.height ?? 900}
          className="h-auto w-full rounded-lg"
          autoPlay
          muted
          loop
        />
      ) : (
        <Dropzone
          maxSize={1024 * 1024 * 10}
          minSize={1024}
          maxFiles={1}
          multiple={false}
          accept={{
            'video/*': [],
          }}
          onDrop={handleDrop}
          src={files}
          onError={console.error}
          className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
        >
          <DropzoneEmptyState className="p-4" />
          <DropzoneContent>
            {files && files.length > 0 && (
              <div
                style={{
                  width: data.width ?? 1600,
                  height: data.height ?? 900,
                }}
                className="relative"
              >
                <video
                  src={URL.createObjectURL(files[0])}
                  className="absolute top-0 left-0 h-full w-full rounded-lg object-cover"
                  width={data.width ?? 1600}
                  height={data.height ?? 900}
                  autoPlay
                  muted
                  loop
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
