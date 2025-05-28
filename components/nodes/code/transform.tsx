import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAnalytics } from '@/hooks/use-analytics';
import { handleError } from '@/lib/error/handle';
import { textModels } from '@/lib/models/text';
import {
  getCodeFromCodeNodes,
  getDescriptionsFromImageNodes,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { useProject } from '@/providers/project';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import Editor from '@monaco-editor/react';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { ClockIcon, PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react';
import {
  type ChangeEventHandler,
  type ComponentProps,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { z } from 'zod';
import type { CodeNodeProps } from '.';
import { ModelSelector } from '../model-selector';
import { LanguageSelector } from './language-selector';

type CodeTransformProps = CodeNodeProps & {
  title: string;
};

const getDefaultModel = (models: typeof textModels) => {
  const defaultModel = models
    .flatMap((model) => model.models)
    .find((model) => model.default);

  if (!defaultModel) {
    throw new Error('No default model found');
  }

  return defaultModel;
};

export const CodeTransform = ({
  data,
  id,
  type,
  title,
}: CodeTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const { project } = useProject();
  const modelId = data.model ?? getDefaultModel(textModels).id;
  const analytics = useAnalytics();
  const { isLoading, object, stop, submit } = useObject({
    api: '/api/code',
    schema: z.object({
      text: z.string(),
      language: z.string(),
    }),
    headers: {
      'tersa-language': data.generated?.language ?? 'javascript',
      'tersa-model': modelId,
    },
    onError: (error) => handleError('Error generating code', error),
    onFinish: (generated) => {
      updateNodeData(id, {
        generated: generated.object,
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

    const prompt = [
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
    ].join('\n');

    submit(prompt);

    analytics.track('canvas', 'node', 'generate', {
      type,
      promptLength: prompt.length,
      model: modelId,
      instructionsLength: data.instructions?.length ?? 0,
    });
  }, [
    data.instructions,
    id,
    getNodes,
    getEdges,
    submit,
    analytics,
    modelId,
    type,
  ]);

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const handleCodeChange = (value: string | undefined) => {
    updateNodeData(id, {
      generated: { text: value, language: data.generated?.language },
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
            value={data.generated?.language ?? 'javascript'}
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

    if (isLoading) {
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
    } else if (object?.text || data.generated?.text) {
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
        tooltip: data.generated?.text ? 'Regenerate' : 'Generate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!project?.id}
          >
            {data.generated?.text ? (
              <RotateCcwIcon size={12} />
            ) : (
              <PlayIcon size={12} />
            )}
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
    isLoading,
    object,
    project?.id,
    modelId,
  ]);

  return (
    <NodeLayout id={id} data={data} title={title} type={type} toolbar={toolbar}>
      <Editor
        className="aspect-square w-full overflow-hidden rounded-b-xl"
        language={data.generated?.language}
        value={object?.text ?? data.generated?.text}
        onChange={handleCodeChange}
        theme="vs-dark"
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
