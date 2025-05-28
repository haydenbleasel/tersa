import { EditorProvider } from '@/components/ui/kibo-ui/editor';
import { cn } from '@/lib/utils';
import { useProject } from '@/providers/project';
import type { Editor, EditorEvents } from '@tiptap/core';
import { useReactFlow } from '@xyflow/react';
import { useRef } from 'react';
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
  const editor = useRef<Editor | null>(null);
  const project = useProject();

  const handleUpdate = ({ editor }: { editor: Editor }) => {
    const json = editor.getJSON();
    const text = editor.getText();

    updateNodeData(id, { content: json, text });
  };

  const handleCreate = (props: EditorEvents['create']) => {
    editor.current = props.editor;

    if (project) {
      props.editor.chain().focus().run();
    }
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
          onCreate={handleCreate}
          immediatelyRender={false}
          content={data.content}
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
