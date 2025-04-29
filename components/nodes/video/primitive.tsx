import { NodeLayout } from '@/components/nodes/layout';
import { Uploader } from '@/components/uploader';
import { useReactFlow } from '@xyflow/react';
import type { VideoNodeProps } from '.';

type VideoPrimitiveProps = VideoNodeProps & {
  title: string;
};

export const VideoPrimitive = ({
  data,
  id,
  type,
  title,
}: VideoPrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const handleUploadCompleted = (url: string, type: string) => {
    updateNodeData(id, {
      content: {
        url,
        type,
      },
    });
  };

  return (
    <NodeLayout id={id} data={data} type={type} title={title}>
      {data.content ? (
        <video
          src={data.content.url}
          className="h-auto w-full rounded-lg"
          playsInline
          autoPlay
          muted
          loop
        />
      ) : (
        <div className="p-4">
          <Uploader
            onUploadCompleted={handleUploadCompleted}
            accept={{
              'video/*': [],
            }}
            className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          />
        </div>
      )}
    </NodeLayout>
  );
};
