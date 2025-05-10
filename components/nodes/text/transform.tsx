import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { handleError } from '@/lib/error/handle';
import { chatModels } from '@/lib/models';
import {
  getDescriptionsFromImageNodes,
  getFilesFromFileNodes,
  getImagesFromImageNodes,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { useChat } from '@ai-sdk/react';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { ClockIcon, PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { ChangeEventHandler, ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { mutate } from 'swr';
import type { TextNodeProps } from '.';
import { ModelSelector } from '../model-selector';

type TextTransformProps = TextNodeProps & {
  title: string;
};

export const TextTransform = ({
  data,
  id,
  type,
  title,
}: TextTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const { projectId } = useParams();
  const { append, messages, setMessages, status, stop } = useChat({
    body: {
      modelId: data.model ?? 'gpt-4',
    },
    onError: (error) => handleError('Error generating text', error),
    onFinish: (message) => {
      updateNodeData(id, {
        generated: {
          text: message.content,
        },
        updatedAt: new Date().toISOString(),
      });

      toast.success('Text generated successfully');

      setTimeout(() => mutate('credits'), 1000);
    },
  });

  const handleGenerate = async () => {
    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const audioPrompts = getTranscriptionFromAudioNodes(incomers);
    const images = getImagesFromImageNodes(incomers);
    const imageDescriptions = getDescriptionsFromImageNodes(incomers);
    const files = getFilesFromFileNodes(incomers);

    if (!textPrompts.length && !audioPrompts.length && !data.instructions) {
      handleError('Error generating text', 'No prompts found');
      return;
    }

    const content: string[] = [];

    if (data.instructions) {
      content.push('--- Instructions ---', data.instructions);
    }

    if (textPrompts.length) {
      content.push('--- Text Prompts ---', ...textPrompts);
    }

    if (audioPrompts.length) {
      content.push('--- Audio Prompts ---', ...audioPrompts);
    }

    if (imageDescriptions.length) {
      content.push('--- Image Descriptions ---', ...imageDescriptions);
    }

    setMessages([]);
    append({
      role: 'user',
      content: content.join('\n'),
      experimental_attachments: [
        ...images.map((image) => ({
          url: image.url,
        })),
        ...files.map((file) => ({
          url: file.url,
        })),
      ],
    });
  };

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const createToolbar = (): ComponentProps<typeof NodeLayout>['toolbar'] => {
    const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [];

    toolbar.push({
      children: (
        <ModelSelector
          value={data.model ?? 'gpt-4'}
          options={chatModels}
          key={id}
          className="w-[200px] rounded-full"
          onChange={(value) => updateNodeData(id, { model: value })}
        />
      ),
    });

    if (status === 'submitted') {
      toolbar.push({
        tooltip: 'Stop',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={stop}
            disabled={!projectId}
          >
            <SquareIcon size={12} />
          </Button>
        ),
      });
    } else if (messages.length || data.generated?.text) {
      toolbar.push({
        tooltip: 'Regenerate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!projectId}
          >
            <RotateCcwIcon size={12} />
          </Button>
        ),
      });
    } else {
      toolbar.push({
        tooltip: 'Generate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!projectId}
          >
            <PlayIcon size={12} />
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

    return toolbar;
  };

  const nonUserMessages = messages.filter((message) => message.role !== 'user');

  return (
    <NodeLayout
      id={id}
      data={data}
      title={title}
      type={type}
      toolbar={createToolbar()}
    >
      <div className="flex flex-1 rounded-t-3xl rounded-b-xl bg-secondary p-4">
        {status === 'submitted' && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-60 animate-pulse rounded-lg" />
            <Skeleton className="h-4 w-40 animate-pulse rounded-lg" />
            <Skeleton className="h-4 w-50 animate-pulse rounded-lg" />
          </div>
        )}
        {data.generated?.text &&
          !nonUserMessages.length &&
          status !== 'submitted' && (
            <ReactMarkdown>{data.generated.text}</ReactMarkdown>
          )}
        {!data.generated?.text &&
          !nonUserMessages.length &&
          status !== 'submitted' && (
            <div className="flex aspect-video w-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Press "Generate" to generate text
              </p>
            </div>
          )}
        {Boolean(nonUserMessages.length) &&
          status !== 'submitted' &&
          nonUserMessages.map((message, index) => (
            <ReactMarkdown key={index}>{message.content}</ReactMarkdown>
          ))}
      </div>
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 resize-none rounded-none border-none bg-transparent shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
