import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAnalytics } from '@/hooks/use-analytics';
import { handleError } from '@/lib/error/handle';
import {
  getCodeFromCodeNodes,
  getDescriptionsFromImageNodes,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { useGateway } from '@/providers/gateway/client';
import { useProject } from '@/providers/project';
import { useChat } from '@ai-sdk/react';
import Editor from '@monaco-editor/react';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { DefaultChatTransport } from 'ai';
import { ClockIcon, PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react';
import {
  type ChangeEventHandler,
  type ComponentProps,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import type { CodeNodeProps } from '.';
import { ModelSelector } from '../model-selector';
import { LanguageSelector } from './language-selector';

type CodeTransformProps = CodeNodeProps & {
  title: string;
};

const getDefaultModel = (models: ReturnType<typeof useGateway>['models']) => {
  const defaultModel = Object.entries(models).find(
    ([_, model]) => model.default
  );

  if (!defaultModel) {
    return 'claude-3-5-sonnet';
  }

  return defaultModel[0];
};

export const CodeTransform = ({
  data,
  id,
  type,
  title,
}: CodeTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const project = useProject();
  const { models: textModels } = useGateway();
  const modelId = data.model ?? getDefaultModel(textModels);
  const language = data.generated?.language ?? 'javascript';
  const analytics = useAnalytics();
  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/code',
    }),
    onError: (error) => handleError('Error generating text', error),
    onFinish: ({ message }) => {
      updateNodeData(id, {
        generated: {
          text: message.parts.find((part) => part.type === 'text')?.text ?? '',
        },
        updatedAt: new Date().toISOString(),
      });

      toast.success('Text generated successfully');

      setTimeout(() => mutate('credits'), 5000);
    },
  });

  const handleGenerate = useCallback(() => {
    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const audioPrompts = getTranscriptionFromAudioNodes(incomers);
    const codePrompts = getCodeFromCodeNodes(incomers);
    const imageDescriptions = getDescriptionsFromImageNodes(incomers);

    if (
      !textPrompts.length &&
      !audioPrompts.length &&
      !codePrompts.length &&
      !imageDescriptions.length &&
      !data.instructions
    ) {
      handleError('Error generating code', 'No prompts found');
      return;
    }

    const content = [
      '--- Instructions ---',
      data.instructions ?? 'None.',
      '--- Text Prompts ---',
      ...textPrompts.join('\n'),
      '--- Audio Prompts ---',
      ...audioPrompts.join('\n'),
      '--- Image Descriptions ---',
      ...imageDescriptions.join('\n'),
      '--- Code Prompts ---',
      ...codePrompts.map(
        (code, index) =>
          `--- Prompt ${index + 1} ---
            Language: ${code.language}
            Code: ${code.text}
            `
      ),
    ];

    analytics.track('canvas', 'node', 'generate', {
      type,
      promptLength: content.join('\n').length,
      model: modelId,
      instructionsLength: data.instructions?.length ?? 0,
    });

    setMessages([]);
    sendMessage(
      { text: content.join('\n') },
      {
        body: {
          modelId,
          language,
        },
      }
    );
  }, [
    data.instructions,
    id,
    getNodes,
    getEdges,
    sendMessage,
    setMessages,
    analytics,
    modelId,
    type,
  ]);

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const handleCodeChange = (value: string | undefined) => {
    updateNodeData(id, {
      generated: { text: value, language },
    });
  };

  const handleLanguageChange = useCallback(
    (value: string) => {
      updateNodeData(id, {
        generated: { text: data.generated?.text, language: value },
      });
    },
    [data.generated?.text, id, updateNodeData]
  );

  const toolbar = useMemo(() => {
    const items: ComponentProps<typeof NodeLayout>['toolbar'] = [
      {
        children: (
          <LanguageSelector
            value={language}
            onChange={handleLanguageChange}
            className="w-[200px] rounded-full"
          />
        ),
      },
      {
        children: (
          <ModelSelector
            value={modelId}
            options={textModels}
            key={id}
            className="w-[200px] rounded-full"
            onChange={(value) => updateNodeData(id, { model: value })}
          />
        ),
      },
    ];

    if (status === 'submitted' || status === 'streaming') {
      items.push({
        tooltip: 'Stop',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={stop}
            disabled={!project?.id}
          >
            <SquareIcon size={12} />
          </Button>
        ),
      });
    } else if (messages.length || data.generated?.text) {
      items.push({
        tooltip: 'Regenerate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!project?.id}
          >
            <RotateCcwIcon size={12} />
          </Button>
        ),
      });
    } else {
      items.push({
        tooltip: 'Generate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!project?.id}
          >
            <PlayIcon size={12} />
          </Button>
        ),
      });
    }

    if (data.updatedAt) {
      items.push({
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

    return items;
  }, [
    id,
    updateNodeData,
    stop,
    data,
    handleGenerate,
    handleLanguageChange,
    status,
    messages,
    project?.id,
    modelId,
    language,
    textModels,
  ]);

  const nonUserMessages = messages.filter((message) => message.role !== 'user');

  return (
    <NodeLayout id={id} data={data} title={title} type={type} toolbar={toolbar}>
      <Editor
        className="aspect-square w-full overflow-hidden rounded-b-xl"
        language={language}
        value={
          nonUserMessages.length
            ? (nonUserMessages[0].parts.find((part) => part.type === 'text')
                ?.text ?? '')
            : data.generated?.text
        }
        onChange={handleCodeChange}
        theme="vs-dark"
        loading={
          <div className="dark aspect-square size-full">
            <Skeleton className="size-full" />
          </div>
        }
        options={{
          readOnly: true,
          minimap: {
            enabled: false,
          },
        }}
      />
      <Textarea
        value={data.instructions ?? ''}
        onChange={handleInstructionsChange}
        placeholder="Enter instructions"
        className="shrink-0 resize-none rounded-none border-none bg-transparent! shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
