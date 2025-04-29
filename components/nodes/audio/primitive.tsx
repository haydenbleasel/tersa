import { transcribeAction } from '@/app/actions/generate/speech/transcribe';
import { NodeLayout } from '@/components/nodes/layout';
import { Uploader } from '@/components/uploader';
import { useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
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
  const { projectId } = useParams();

  const handleUploadCompleted = async (url: string, type: string) => {
    const transcription = await transcribeAction(url, projectId as string);

    if ('error' in transcription) {
      throw new Error(transcription.error);
    }

    updateNodeData(id, {
      audio: {
        url,
        type,
      },
      transcript: transcription.transcript,
    });
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      <div className="p-4">
        {data.audio ? (
          // biome-ignore lint/a11y/useMediaCaption: <explanation>
          <audio src={data.audio.url} controls />
        ) : (
          <Uploader
            onUploadCompleted={handleUploadCompleted}
            accept={{
              'audio/*': [],
            }}
            className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          />
        )}
      </div>
    </NodeLayout>
  );
};
