import { useNodeConnections } from "@xyflow/react";
import { CodePrimitive } from "./primitive";
import { CodeTransform } from "./transform";

export type CodeNodeProps = {
  type: string;
  data: {
    generated?: {
      text?: string;
      language?: string;
    };
    model?: string;
    updatedAt?: string;
    instructions?: string;
    content?: {
      text?: string;
      language?: string;
    };
  };
  id: string;
};

export const CodeNode = (props: CodeNodeProps) => {
  const connections = useNodeConnections({
    id: props.id,
    handleType: "target",
  });
  const Component = connections.length ? CodeTransform : CodePrimitive;

  return <Component {...props} title="Code" />;
};
