import type { Editor, EditorEvents } from "@tiptap/core";
import { useReactFlow } from "@xyflow/react";
import { useRef } from "react";
import { EditorProvider } from "@/components/kibo-ui/editor";
import { cn } from "@/lib/utils";
import { useProject } from "@/providers/project";
import { NodeLayout } from "../layout";
import type { TextNodeProps } from ".";

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

  const handleCreate = (props: EditorEvents["create"]) => {
    editor.current = props.editor;

    if (project) {
      props.editor.chain().focus().run();
    }
  };

  return (
    <NodeLayout
      className="overflow-hidden p-0"
      data={data}
      id={id}
      title={title}
      type={type}
    >
      <div className="nowheel h-full max-h-[30rem] overflow-auto">
        <EditorProvider
          className={cn(
            "prose prose-sm dark:prose-invert size-full p-6",
            "[&_p:first-child]:mt-0",
            "[&_p:last-child]:mb-0"
          )}
          content={data.content}
          immediatelyRender={false}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          placeholder="Start typing..."
        />
      </div>
    </NodeLayout>
  );
};
