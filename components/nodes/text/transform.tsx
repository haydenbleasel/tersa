import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatModels } from '@/lib/models';
import {
  getDescriptionsFromImageNodes,
  getImagesFromImageNodes,
  getRecursiveIncomers,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { useChat } from '@ai-sdk/react';
import { useReactFlow } from '@xyflow/react';
import {
  ClockIcon,
  Loader2Icon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react';
import type { ChangeEventHandler, ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
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
  const { append, messages, setMessages, status, stop } = useChat({
    body: {
      modelId: data.model ?? 'gpt-4',
    },
    initialMessages: data.text
      ? [
          {
            id: 'system-message',
            role: 'system',
            content: data.text,
          },
        ]
      : undefined,
    onError: (error) => toast.error(error.message),
    onFinish: () => {
      updateNodeData(id, {
        text: messages
          .filter((message) => message.role !== 'user')
          .map((message) => message.content)
          .join('\n'),
        updatedAt: new Date().toISOString(),
      });
    },
  });

  const handleGenerate = async () => {
    const incoming = getRecursiveIncomers(id, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incoming);
    const audioPrompts = getTranscriptionFromAudioNodes(incoming);
    const images = getImagesFromImageNodes(incoming);
    const imageDescriptions = getDescriptionsFromImageNodes(incoming);

    if (!textPrompts.length && !audioPrompts.length) {
      toast.error('No prompts found');
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

  const nonUserMessages = messages.filter((message) => message.role !== 'user');

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

    if (status === 'submitted' || status === 'streaming') {
      toolbar.push({
        tooltip: 'Stop',
        children: (
          <Button size="icon" className="rounded-full" onClick={stop}>
            <SquareIcon size={12} />
          </Button>
        ),
      });
    } else if (nonUserMessages.length) {
      toolbar.push({
        tooltip: 'Regenerate',
        children: (
          <Button size="icon" className="rounded-full" onClick={handleGenerate}>
            <RotateCcwIcon size={12} />
          </Button>
        ),
      });
    } else {
      toolbar.push({
        tooltip: 'Generate',
        children: (
          <Button size="icon" className="rounded-full" onClick={handleGenerate}>
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
        {!nonUserMessages.length && status !== 'streaming' && (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Press "Generate" to generate text
            </p>
          </div>
        )}
        {nonUserMessages.map((message, index) => (
          <ReactMarkdown key={index}>{message.content}</ReactMarkdown>
        ))}
      </div>
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 rounded-none rounded-b-lg border-none bg-secondary/50 shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
