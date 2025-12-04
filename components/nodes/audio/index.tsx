import { useNodeConnections } from "@xyflow/react";
import { AudioPrimitive } from "./primitive";
import { AudioTransform } from "./transform";

export type AudioNodeProps = {
  type: string;
  data: {
    content?: {
      url: string;
      type: string;
    };
    generated?: {
      url: string;
      type: string;
    };
    updatedAt?: string;
    model?: string;
    voice?: string;
    transcript?: string;
    instructions?: string;
  };
  id: string;
};

export const AudioNode = (props: AudioNodeProps) => {
  const connections = useNodeConnections({
    id: props.id,
    handleType: "target",
  });
  const Component = connections.length ? AudioTransform : AudioPrimitive;

  return <Component {...props} title="Audio" />;
};
