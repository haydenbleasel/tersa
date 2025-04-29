import { generateImageAction } from '@/app/actions/image/create';
import { describeAction } from '@/app/actions/image/describe';
import { editImageAction } from '@/app/actions/image/edit';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { imageModels } from '@/lib/models';
import {
  getImagesFromImageNodes,
  getRecursiveIncomers,
  getTextFromTextNodes,
} from '@/lib/xyflow';
import { useReactFlow } from '@xyflow/react';
import { ClockIcon, Loader2Icon, PlayIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { type ChangeEventHandler, type ComponentProps, useState } from 'react';
import { toast } from 'sonner';
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
  const [image, setImage] = useState<string | null>(data.content?.url ?? null);
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleGenerate = async () => {
    if (loading) {
      return;
    }

    const incoming = getRecursiveIncomers(id, getNodes(), getEdges());
    const textNodes = getTextFromTextNodes(incoming);
    const imageNodes = getImagesFromImageNodes(incoming);

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
        content: {
          url: response.url,
          type: response.type,
        },
        description: description.description,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
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
      tooltip: 'Generate',
      children: (
        <Button
          size="icon"
          className="rounded-full"
          onClick={handleGenerate}
          disabled={loading}
        >
          <PlayIcon size={12} />
        </Button>
      ),
    },
  ];

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
      <div>
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
            className="aspect-video w-full rounded-t-lg object-cover"
          />
        )}
      </div>
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 resize-none rounded-none rounded-b-lg border-none bg-secondary/50 shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
