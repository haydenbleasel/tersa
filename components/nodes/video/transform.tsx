import { generateVideoAction } from '@/app/actions/video/create';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAnalytics } from '@/hooks/use-analytics';
import { download } from '@/lib/download';
import { handleError } from '@/lib/error/handle';
import { videoModels } from '@/lib/models/video';
import { getImagesFromImageNodes, getTextFromTextNodes } from '@/lib/xyflow';
import { useProject } from '@/providers/project';
import { getIncomers, useReactFlow } from '@xyflow/react';
import {
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
} from 'lucide-react';
import { type ChangeEventHandler, type ComponentProps, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import type { VideoNodeProps } from '.';
import { ModelSelector } from '../model-selector';

type VideoTransformProps = VideoNodeProps & {
  title: string;
};

const getDefaultModel = (models: typeof videoModels) => {
  const defaultModel = Object.entries(models).find(
    ([_, model]) => model.default
  );

  if (!defaultModel) {
    throw new Error('No default model found');
  }

  return defaultModel[0];
};

export const VideoTransform = ({
  data,
  id,
  type,
  title,
}: VideoTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const project = useProject();
  const modelId = data.model ?? getDefaultModel(videoModels);
  const analytics = useAnalytics();

  const handleGenerate = async () => {
    if (loading || !project?.id) {
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

      analytics.track('canvas', 'node', 'generate', {
        type,
        promptLength: textPrompts.join('\n').length,
        model: modelId,
        instructionsLength: data.instructions?.length ?? 0,
        imageCount: images.length,
      });

      const response = await generateVideoAction({
        modelId,
        prompt: [data.instructions ?? '', ...textPrompts].join('\n'),
        images: images.slice(0, 1),
        nodeId: id,
        projectId: project.id,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      updateNodeData(id, response.nodeData);

      toast.success('Video generated successfully');

      setTimeout(() => mutate('credits'), 5000);
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
          value={modelId}
          options={videoModels}
          key={id}
          className="w-[200px] rounded-full"
          onChange={(value) => updateNodeData(id, { model: value })}
        />
      ),
    },
    loading
      ? {
          tooltip: 'Generating...',
          children: (
            <Button size="icon" className="rounded-full" disabled>
              <Loader2Icon className="animate-spin" size={12} />
            </Button>
          ),
        }
      : {
          tooltip: data.generated?.url ? 'Regenerate' : 'Generate',
          children: (
            <Button
              size="icon"
              className="rounded-full"
              onClick={handleGenerate}
              disabled={loading || !project?.id}
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
      {loading && (
        <Skeleton className="flex aspect-video w-full animate-pulse items-center justify-center rounded-b-xl">
          <Loader2Icon
            size={16}
            className="size-4 animate-spin text-muted-foreground"
          />
        </Skeleton>
      )}
      {!loading && !data.generated?.url && (
        <div className="flex aspect-video w-full items-center justify-center rounded-b-xl bg-secondary">
          <p className="text-muted-foreground text-sm">
            Press <PlayIcon size={12} className="-translate-y-px inline" /> to
            generate video
          </p>
        </div>
      )}
      {data.generated?.url && !loading && (
        <video
          src={data.generated.url}
          width={data.width ?? 800}
          height={data.height ?? 450}
          autoPlay
          muted
          loop
          playsInline
          className="w-full rounded-b-xl object-cover"
        />
      )}
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 resize-none rounded-none border-none bg-transparent! shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
