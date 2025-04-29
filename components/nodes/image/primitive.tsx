import { describeAction } from '@/app/actions/image/describe';
import { NodeLayout } from '@/components/nodes/layout';
import { Uploader } from '@/components/uploader';
import { useReactFlow } from '@xyflow/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import type { ImageNodeProps } from '.';

type ImagePrimitiveProps = ImageNodeProps & {
  title: string;
};

const getImageDimensions = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image();
    image.src = url;

    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });

export const ImagePrimitive = ({
  data,
  id,
  type,
  title,
}: ImagePrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const { projectId } = useParams();

  const handleUploadCompleted = async (url: string, type: string) => {
    try {
      const response = await getImageDimensions(url);
      const description = await describeAction(url, type, projectId as string);

      if ('error' in description) {
        throw new Error(description.error);
      }

      updateNodeData(id, {
        content: {
          url,
          type,
        },
        width: response.width,
        height: response.height,
        description: description.description,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      toast.error(message);
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
        <div className="p-4">
          <Uploader
            onUploadCompleted={handleUploadCompleted}
            accept={{
              'image/*': [],
            }}
            className="rounded-none border-none bg-transparent p-0 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          />
        </div>
      )}
    </NodeLayout>
  );
};
