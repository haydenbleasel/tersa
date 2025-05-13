import { EditorProvider } from '@/components/ui/kibo-ui/editor';
import { cn } from '@/lib/utils';
import type { Editor, JSONContent } from '@tiptap/core';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import type { TextNodeProps } from '.';
import { NodeLayout } from '../layout';

type TextPrimitiveProps = TextNodeProps & {
  title: string;
};

export const TextPrimitive = ({
  data,
  id,
  type,
  title,
}: TextPrimitiveProps) => {
  const { updateNodeData } = useReactFlow();
  const [content, setContent] = useState<JSONContent | undefined>(
    data.content ?? undefined
  );

  const handleUpdate = ({ editor }: { editor: Editor }) => {
    const json = editor.getJSON();
    const text = editor.getText();

    setContent(json);
    updateNodeData(id, { content: json, text });
  };

  return (
    <NodeLayout
      id={id}
      data={data}
      title={title}
      type={type}
      className="overflow-hidden p-0"
    >
      <div className="nowheel h-full max-h-[30rem] overflow-auto">
        <EditorProvider
          onCreate={(props) => {
            props.editor.chain().focus().run();
          }}
          immediatelyRender={false}
          content={content}
          placeholder="Start typing..."
          className={cn(
            'prose prose-sm dark:prose-invert size-full p-6',
            '[&_p:first-child]:mt-0',
            '[&_p:last-child]:mb-0'
          )}
          onUpdate={handleUpdate}
        />
      </div>
    </NodeLayout>
  );
};
