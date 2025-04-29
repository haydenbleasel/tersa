import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleError } from '@/lib/error/handle';
import { chatModels } from '@/lib/models';
import {
  getDescriptionsFromImageNodes,
  getImagesFromImageNodes,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { useChat } from '@ai-sdk/react';
import { getIncomers, useReactFlow } from '@xyflow/react';
import {
  ClockIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useParams } from 'next/navigation';
import type { ChangeEventHandler, ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
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
    onFinish: () => {
      updateNodeData(id, {
        generated: messages
          .filter((message) => message.role !== 'user')
          .map((message) => message.content),
        updatedAt: new Date().toISOString(),
      });
    },
  });

  const handleGenerate = async () => {
    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const audioPrompts = getTranscriptionFromAudioNodes(incomers);
    const images = getImagesFromImageNodes(incomers);
    const imageDescriptions = getDescriptionsFromImageNodes(incomers);

    if (!textPrompts.length && !audioPrompts.length) {
      handleError('Error generating text', 'No prompts found');
      return;
    }

    setMessages([]);
    append({
      role: 'user',
      content: [
        '--- Instructions ---',
        data.instructions ?? 'None.',
        '--- Text Prompts ---',
        ...textPrompts,
        '--- Audio Prompts ---',
        ...audioPrompts,
        '--- Image Descriptions ---',
        ...imageDescriptions,
      ].join('\n'),
      experimental_attachments: images.map((image) => ({
        url: image.url,
      })),
    });
  };

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const nonUserMessages = messages.length
    ? messages.filter((message) => message.role !== 'user')
    : data.generated?.map((message) => ({
        id: nanoid(),
        role: 'system',
        content: message,
      }));

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
    } else if (nonUserMessages?.length) {
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
        tooltip: data.generated?.length ? 'Regenerate' : 'Generate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!projectId}
          >
            {data.generated?.length ? (
              <RotateCcwIcon size={12} />
            ) : (
              <PlayIcon size={12} />
            )}
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

  return (
    <NodeLayout
      id={id}
      data={data}
      title={title}
      type={type}
      toolbar={createToolbar()}
    >
      <div className="flex-1 p-4">
        {status === 'streaming' && (
          <div className="flex items-center justify-center">
            <Loader2Icon size={16} className="animate-spin" />
          </div>
        )}
        {!nonUserMessages?.length && status !== 'streaming' && (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to generate text
            </p>
          </div>
        )}
        {nonUserMessages?.map((message, index) => (
          <ReactMarkdown key={index}>{message.content}</ReactMarkdown>
        ))}
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
