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
  const [video, setVideo] = useState<string | null>(
    data.generated?.url ?? null
  );
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleGenerate = async () => {
    try {
      const incomers = getIncomers({ id }, getNodes(), getEdges());
      const textPrompts = getTextFromTextNodes(incomers);
      const images = getImagesFromImageNodes(incomers);

      if (!textPrompts.length && !images.length) {
        throw new Error('No prompts found');
      }

      setLoading(true);

      const response = await generateVideoAction(
        data.model ?? 'T2V-01-Director',
        [data.instructions ?? '', ...textPrompts].join('\n'),
        images.slice(0, 1)
      );

      if ('error' in response) {
        throw new Error(response.error);
      }

      setVideo(response.url);

      updateNodeData(id, {
        updatedAt: new Date().toISOString(),
        generated: response,
      });
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
          <Skeleton
            className="h-full w-full animate-pulse rounded-tl-lg"
            style={{
              width: data.width ?? 800,
              height: data.height ?? 450,
            }}
          />
        )}
        {!loading && !video && (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to create a video
            </p>
          </div>
        )}
        {video && (
          <video
            src={video}
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
