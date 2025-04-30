import { NodeLayout } from '@/components/nodes/layout';
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone';
import { handleError } from '@/lib/error/handle';
import { uploadFile } from '@/lib/upload';
import { useReactFlow } from '@xyflow/react';
import { FileIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import type { FileNodeProps } from '.';

type FilePrimitiveProps = FileNodeProps & {
  title: string;
};

const FilePreview = ({
  name,
  type,
  url,
}: { name: string; type: string; url: string }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <FileIcon size={16} className="text-muted-foreground" />
      <span className="truncate font-medium text-sm">{name}</span>
    </div>
    {type === 'application/pdf' ? (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded border">
        <iframe
          src={`${url}#view=FitH`}
          className="absolute inset-0 h-full w-full"
          title="PDF Preview"
        />
      </div>
    ) : (
      <div className="flex items-center justify-center rounded border p-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary text-sm hover:underline"
        >
          <FileIcon size={16} />
          <span>Download File</span>
        </a>
      </div>
    )}
  </div>
);

export const FilePrimitive = ({
  data,
  id,
  type,
  title,
}: FilePrimitiveProps) => {
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

      if (files.some((file) => file.type.startsWith('audio'))) {
        throw new Error('Please use the audio node to upload audio files.');
      }

      if (files.some((file) => file.type.startsWith('video'))) {
        throw new Error('Please use the video node to upload video files.');
      }

      if (files.some((file) => file.type.startsWith('image'))) {
        throw new Error('Please use the image node to upload image files.');
      }

      setIsUploading(true);
      setFiles(files);
      const [file] = files;

      const { url, type } = await uploadFile(file, 'files');

      updateNodeData(id, {
        content: {
          url,
          name: file.name,
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
      <div className="p-4">
        {data.content ? (
          <FilePreview {...data.content} />
        ) : (
          <Dropzone
            maxSize={1024 * 1024 * 10}
            minSize={1024}
            maxFiles={1}
            multiple={false}
            onDrop={handleDrop}
            src={files}
            onError={console.error}
            className="rounded-none border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {files && files.length > 0 && (
                <div className="relative">
                  <FilePreview
                    name={files[0].name}
                    type={files[0].type}
                    url={URL.createObjectURL(files[0])}
                  />
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50">
                    <Loader2Icon className="size-12 animate-spin text-white" />
                  </div>
                </div>
              )}
            </DropzoneContent>
          </Dropzone>
        )}
      </div>
    </NodeLayout>
  );
};
