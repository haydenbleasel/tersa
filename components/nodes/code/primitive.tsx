import Editor from '@monaco-editor/react';
import { useReactFlow } from '@xyflow/react';
import type { ComponentProps } from 'react';
import type { CodeNodeProps } from '.';
import { NodeLayout } from '../layout';
import { LanguageSelector } from './language-selector';

type CodePrimitiveProps = CodeNodeProps & {
  title: string;
};

export const CodePrimitive = ({
  data,
  id,
  type,
  title,
}: CodePrimitiveProps) => {
  const { updateNodeData } = useReactFlow();

  const handleCodeChange = (value: string | undefined) => {
    updateNodeData(id, {
      content: { text: value, language: data.content?.language },
    });
  };

  const handleLanguageChange = (value: string) => {
    updateNodeData(id, {
      content: { text: data.content?.text, language: value },
    });
  };

  const toolbar: ComponentProps<typeof NodeLayout>['toolbar'] = [
    {
      children: (
        <LanguageSelector
          value={data.content?.language ?? 'javascript'}
          onChange={handleLanguageChange}
          className="w-[200px] rounded-full"
        />
      ),
    },
  ];

  return (
    <NodeLayout id={id} data={data} title={title} type={type} toolbar={toolbar}>
      <Editor
        className="aspect-square w-full"
        language={data.content?.language}
        value={data.content?.text}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          minimap: {
            enabled: false,
          },
        }}
      />
    </NodeLayout>
  );
};
