import { EditorProvider } from '@/components/ui/kibo-ui/editor';
import { cn } from '@/lib/utils';
import type { Editor, JSONContent } from '@tiptap/core';
import { NodeResizeControl, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

type CommentNodeProps = {
  data: {
    content: JSONContent;
  };
  id: string;
};

export const CommentNode = ({ data, id }: CommentNodeProps) => {
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
    <>
      <EditorProvider
        autofocus
        immediatelyRender={false}
        content={content}
        placeholder="Start typing..."
        className={cn(
          'prose dark:prose-invert size-full',
          '[&_p:first-child]:mt-0',
          '[&_p:last-child]:mb-0'
        )}
        onUpdate={handleUpdate}
      />
      <NodeResizeControl minWidth={100} minHeight={40} />
    </>
  );
};
