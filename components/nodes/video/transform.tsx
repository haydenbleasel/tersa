import { generateVideoAction } from '@/app/actions/generate/video/create';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { videoModels } from '@/lib/models';
import {
  getImagesFromImageNodes,
  getRecursiveIncomers,
  getTextFromTextNodes,
} from '@/lib/xyflow';
import { useReactFlow } from '@xyflow/react';
import { ClockIcon, Loader2Icon, PlayIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
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
  const { updateNodeData, getNodes, getEdges, getNode } = useReactFlow();
  const [video, setVideo] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const incomers = getRecursiveIncomers(id, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const imagePrompts = getImagesFromImageNodes(incomers);

    if (!textPrompts.length && !imagePrompts.length) {
      toast.error('No prompts found');
      return;
    }

    try {
      setLoading(true);
      const response = await generateVideoAction(
        [...textPrompts, ...imagePrompts].join('\n'),
        data.model ?? 'T2V-01-Director'
      );
      setVideo(response);
      updateNodeData(id, {
        updatedAt: new Date().toISOString(),
        video: response,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
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
      tooltip: 'Generate',
      children: (
        <Button size="icon" className="rounded-full" onClick={handleGenerate}>
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
        {loading && !video && (
          <div className="flex items-center justify-center p-4">
            <Loader2Icon size={16} className="animate-spin" />
          </div>
        )}
        {!loading && !video && (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to create a video
            </p>
          </div>
        )}
        {video && (
          // biome-ignore lint/a11y/useMediaCaption: <explanation>
          <video
            src={URL.createObjectURL(new Blob([video]))}
            width={1600}
            height={900}
            className="aspect-video w-full object-cover"
          />
        )}
      </div>
    </NodeLayout>
  );
};
