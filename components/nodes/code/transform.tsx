import { NodeLayout } from '@/components/nodes/layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleError } from '@/lib/error/handle';
import { chatModels } from '@/lib/models';
import {
  getCodeFromCodeNodes,
  getTextFromTextNodes,
  getTranscriptionFromAudioNodes,
} from '@/lib/xyflow';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import Editor from '@monaco-editor/react';
import { getIncomers, useReactFlow } from '@xyflow/react';
import { ClockIcon, PlayIcon, RotateCcwIcon, SquareIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { ChangeEventHandler, ComponentProps } from 'react';
import { z } from 'zod';
import type { CodeNodeProps } from '.';
import { ModelSelector } from '../model-selector';
import { LanguageSelector } from './language-selector';

type CodeTransformProps = CodeNodeProps & {
  title: string;
};

export const CodeTransform = ({
  data,
  id,
  type,
  title,
}: CodeTransformProps) => {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const { projectId } = useParams();
  const { isLoading, object, stop, submit } = useObject({
    api: '/api/code',
    schema: z.object({
      text: z.string(),
      language: z.string(),
    }),
    headers: {
      'tersa-language': data.generated?.language ?? 'javascript',
      'tersa-model': data.model ?? 'gpt-4',
    },
    onError: (error) => handleError('Error generating code', error),
    onFinish: (generated) => {
      updateNodeData(id, {
        generated: generated.object,
        updatedAt: new Date().toISOString(),
      });
    },
  });

  const handleGenerate = () => {
    const incomers = getIncomers({ id }, getNodes(), getEdges());
    const textPrompts = getTextFromTextNodes(incomers);
    const audioPrompts = getTranscriptionFromAudioNodes(incomers);
    const codePrompts = getCodeFromCodeNodes(incomers);

    if (!textPrompts.length && !audioPrompts.length && !codePrompts.length) {
      handleError('Error generating code', 'No prompts found');
      return;
    }

    submit(
      [
        '--- Instructions ---',
        data.instructions ?? 'None.',
        '--- Text Prompts ---',
        ...textPrompts.join('\n'),
        '--- Audio Prompts ---',
        ...audioPrompts.join('\n'),
        '--- Code Prompts ---',
        ...codePrompts.map(
          (code, index) =>
            `--- Prompt ${index + 1} ---
            Language: ${code.language}
            Code: ${code.text}
            `
        ),
      ].join('\n')
    );
  };

  const handleInstructionsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => updateNodeData(id, { instructions: event.target.value });

  const handleCodeChange = (value: string | undefined) => {
    updateNodeData(id, {
      generated: { text: value, language: data.generated?.language },
    });
  };

  const handleLanguageChange = (value: string) => {
    updateNodeData(id, {
      generated: { text: data.generated?.text, language: value },
    });
  };

  const createToolbar = (): ComponentProps<typeof NodeLayout>['toolbar'] => {
    const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [
      {
        children: (
          <LanguageSelector
            value={data.generated?.language ?? 'javascript'}
            onChange={handleLanguageChange}
            className="w-[200px] rounded-full"
          />
        ),
      },
    ];

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

    if (isLoading) {
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
    } else if (object?.text || data.generated?.text) {
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
        tooltip: data.generated?.text ? 'Regenerate' : 'Generate',
        children: (
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleGenerate}
            disabled={!projectId}
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
        className="shrink-0 resize-none rounded-none border-none bg-transparent shadow-none focus-visible:ring-0"
      />
    </NodeLayout>
  );
};
