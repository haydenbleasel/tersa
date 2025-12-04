import type { JSONContent } from "@tiptap/core";
import { useNodeConnections } from "@xyflow/react";
import { TextPrimitive } from "./primitive";
import { TextTransform } from "./transform";

export type TextNodeProps = {
  type: string;
  data: {
    generated?: {
      text: string;
    };
    model?: string;
    updatedAt?: string;
    instructions?: string;

    // Tiptap generated JSON content
    content?: JSONContent;

    // Tiptap text content
    text?: string;
  };
  id: string;
};

export const TextNode = (props: TextNodeProps) => {
  const connections = useNodeConnections({
    id: props.id,
    handleType: "target",
  });
  const Component = connections.length ? TextTransform : TextPrimitive;

  return <Component {...props} title="Text" />;
};
