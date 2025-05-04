import { generateSpeechAction } from '@/app/actions/generate/speech/create';
import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { download } from '@/lib/download';
import { handleError } from '@/lib/error/handle';
import { speechModels } from '@/lib/models';
import { getTextFromTextNodes } from '@/lib/xyflow';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { ClockIcon, DownloadIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { type ComponentProps, useState } from 'react';
import type { AudioNodeProps } from '.';
import { ModelSelector } from '../model-selector';

type AudioTransformProps = AudioNodeProps & {
  title: string;
};

export const AudioTransform = ({
  data,
  id,
  type,
  title,
}: AudioTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [audio, setAudio] = useState<string | null>(
    data.generated?.url ?? null
  );
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleGenerate = async () => {
    if (loading) {
      return;
    }

    try {
      const incomers = getIncomers({ id }, getNodes(), getEdges());
      const textPrompts = getTextFromTextNodes(incomers);

      if (!textPrompts.length) {
        throw new Error('No prompts found');
      }

      setLoading(true);

      const response = await generateSpeechAction(textPrompts);

      if ('error' in response) {
        throw new Error(response.error);
      }

      setAudio(response.url);

      updateNodeData(id, {
        updatedAt: new Date().toISOString(),
        generated: response,
        transcript: textPrompts,
      });
    } catch (error) {
      handleError('Error generating audio', error);
    } finally {
      setLoading(false);
    }
  };

  const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [
    {
      children: (
        <ModelSelector
          value={data.model ?? 'tts-1'}
          options={speechModels}
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

  if (data.generated) {
    toolbar.push({
      tooltip: 'Download',
      children: (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => download(data.generated, id, 'mp3')}
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

  return (
    <NodeLayout id={id} data={data} type={type} title={title} toolbar={toolbar}>
      <div className="flex flex-1 items-center justify-center rounded-lg bg-secondary/50">
        {loading && (
          <Skeleton className="h-[108px] w-[600px] animate-pulse rounded-full" />
        )}
        {!loading && !audio && (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to synthesize speech
            </p>
          </div>
        )}
        {audio && (
          <div className="flex items-center justify-center p-4">
            {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
            <audio src={audio} controls />
          </div>
        )}
      </div>
    </NodeLayout>
  );
};
