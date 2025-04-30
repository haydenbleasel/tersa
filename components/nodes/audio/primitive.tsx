import { transcribeAction } from '@/app/actions/generate/speech/transcribe';
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
import { useParams } from 'next/navigation';
import { useState } from 'react';
import type { AudioNodeProps } from '.';

type AudioPrimitiveProps = AudioNodeProps & {
  title: string;
};

export const AudioPrimitive = ({
  data,
  id,
  type,
  title,
}: AudioPrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const [files, setFiles] = useState<File[] | undefined>();
  const { projectId } = useParams();
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

      const response = await transcribeAction(url, projectId as string);

      if ('error' in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, {
        transcript: response.transcript,
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
          // biome-ignore lint/a11y/useMediaCaption: <explanation>
          <audio src={data.content.url} controls />
        ) : (
          <Dropzone
            maxSize={1024 * 1024 * 10}
            minSize={1024}
            maxFiles={1}
            multiple={false}
            accept={{
              'audio/*': [],
            }}
            onDrop={handleDrop}
            src={files}
            onError={console.error}
            className="rounded-none border-none bg-transparent shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <DropzoneEmptyState />
            <DropzoneContent>
              {files && files.length > 0 && (
                <div className="relative">
                  {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
                  <audio src={URL.createObjectURL(files[0])} controls />
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
