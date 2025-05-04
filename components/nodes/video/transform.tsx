import { generateVideoAction } from '@/app/actions/generate/video/create';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { download } from '@/lib/download';
import { handleError } from '@/lib/error/handle';
import { videoModels } from '@/lib/models';
import { getImagesFromImageNodes, getTextFromTextNodes } from '@/lib/xyflow';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { ClockIcon, DownloadIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { type ChangeEventHandler, type ComponentProps, useState } from 'react';
import { toast } from 'sonner';
import type { VideoNodeProps } from '.';
import { ModelSelector } from '../model-selector';

type VideoTransformProps = VideoNodeProps & {
  title: string;
};

export const VideoTransform = ({
  data,
  id,
  type,
  title,
}: VideoTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleGenerate = async () => {
    if (loading || typeof projectId !== 'string') {
      return;
    }

    try {
      const incomers = getIncomers({ id }, getNodes(), getEdges());
      const textPrompts = getTextFromTextNodes(incomers);
      const images = getImagesFromImageNodes(incomers);

      if (!textPrompts.length && !images.length) {
        throw new Error('No prompts found');
      }

      setLoading(true);

      const response = await generateVideoAction({
        modelId: data.model ?? 'T2V-01-Director',
        prompt: [data.instructions ?? '', ...textPrompts].join('\n'),
        images: images.slice(0, 1),
        nodeId: id,
        projectId,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, response.nodeData);

      toast.success('Video generated successfully');
    } catch (error) {
      handleError('Error generating video', error);
    } finally {
      setLoading(false);
    }
  };

  const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [
    {
      children: (
        <ModelSelector
          value={data.model ?? 'T2V-01-Director'}
          options={videoModels}
          key={id}
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
      tooltip: 'Download',
      children: (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => download(data.generated, id, 'mp4')}
        >
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

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  return (
    <NodeLayout id={id} data={data} type={type} title={title} toolbar={toolbar}>
      <div className="flex flex-1 items-center justify-center rounded-t-lg bg-secondary/50">
        {loading && (
          <Skeleton className="aspect-video w-full animate-pulse rounded-tl-lg" />
        )}
        {!loading && !data.generated?.url && (
          <div className="flex aspect-video w-full items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to generate video
            </p>
          </div>
        )}
        {data.generated?.url && (
          <video
            src={data.generated.url}
            width={data.width ?? 800}
            height={data.height ?? 450}
            autoPlay
            muted
            loop
            playsInline
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
