import { generateImageAction } from '@/app/actions/image/create';
import { describeAction } from '@/app/actions/image/describe';
import { editImageAction } from '@/app/actions/image/edit';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleError } from '@/lib/error/handle';
import { imageModels } from '@/lib/models';
import { getImagesFromImageNodes, getTextFromTextNodes } from '@/lib/xyflow';
import { getIncomers, useReactFlow } from '@xyflow/react';
import {
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { type ChangeEventHandler, type ComponentProps, useState } from 'react';
import type { ImageNodeProps } from '.';
import { ModelSelector } from '../model-selector';

type ImageTransformProps = ImageNodeProps & {
  title: string;
};

export const ImageTransform = ({
  data,
  id,
  type,
  title,
}: ImageTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [image, setImage] = useState<string | null>(
    data.generated?.url ?? null
  );
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleGenerate = async () => {
    if (loading) {
      return;
    }

    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textNodes = getTextFromTextNodes(incomers);
    const imageNodes = getImagesFromImageNodes(incomers);

    try {
      setLoading(true);

      const response = imageNodes.length
        ? await editImageAction(imageNodes, data.instructions)
        : await generateImageAction(
            [...textNodes, ...imageNodes].join('\n'),
            data.model ?? 'dall-e-3',
            data.instructions
          );

      if ('error' in response) {
        throw new Error(response.error);
      }

      setImage(response.url);

      const description = await describeAction(
        response.url,
        projectId as string
      );

      if ('error' in description) {
        throw new Error(description.error);
      }

      updateNodeData(id, {
        updatedAt: new Date().toISOString(),
        generated: {
          url: response.url,
          type: response.type,
        },
        description: description.description,
      });
    } catch (error) {
      handleError('Error generating image', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (data.generated?.url) {
      const link = document.createElement('a');
      link.href = data.generated.url;
      link.download = `image-${id}.${data.generated.type.split('/')[1] || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [
    {
      children: (
        <ModelSelector
          value={data.model ?? 'dall-e-3'}
          options={imageModels}
          id={id}
          className="w-[200px] rounded-full"
          onChange={(value) => updateNodeData(id, { model: value })}
        />
      ),
    },
    {
      tooltip: data.generated?.url ? 'Regenerate' : 'Generate',
      children: (
        <Button
          size="icon"
          className="rounded-full"
          onClick={handleGenerate}
          disabled={loading || !projectId}
        >
          {data.generated?.url ? (
            <RotateCcwIcon size={12} />
          ) : (
            <PlayIcon size={12} />
          )}
        </Button>
      ),
    },
  ];

  if (data.generated?.url) {
    toolbar.push({
      tooltip: 'Download Image',
      children: (
        <Button size="icon" className="rounded-full" onClick={handleDownload}>
          <DownloadIcon size={12} />
        </Button>
      ),
    });
  }

  if (data.updatedAt) {
    toolbar.push({
      tooltip: `Last updated: ${new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(data.updatedAt))}`,
      children: (
        <Button size="icon" variant="ghost" className="rounded-full">
          <ClockIcon size={12} />
        </Button>
      ),
    });
  }

  return (
    <NodeLayout id={id} data={data} type={type} title={title} toolbar={toolbar}>
      <div className="flex flex-1 items-center justify-center rounded-t-lg bg-secondary/50">
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2Icon size={16} className="animate-spin" />
          </div>
        )}
        {!loading && !image && (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to create an image
            </p>
          </div>
        )}
        {image && !loading && (
          <Image
            src={image}
            alt="Generated image"
            width={1600}
            height={900}
            className="w-full rounded-t-lg object-cover"
          />
        )}
      </div>
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 resize-none rounded-none rounded-b-lg border-none shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
