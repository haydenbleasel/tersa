import Editor from "@monaco-editor/react";
import { useReactFlow } from "@xyflow/react";
import type { ComponentProps } from "react";
import { NodeLayout } from "../layout";
import type { CodeNodeProps } from ".";
import { LanguageSelector } from "./language-selector";

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

  const toolbar: ComponentProps<typeof NodeLayout>["toolbar"] = [
    {
      children: (
        <LanguageSelector
          className="w-[200px] rounded-full"
          onChange={handleLanguageChange}
          value={data.content?.language ?? "javascript"}
        />
      ),
    },
  ];

  return (
    <NodeLayout data={data} id={id} title={title} toolbar={toolbar} type={type}>
      <Editor
        className="aspect-square w-full"
        language={data.content?.language}
        onChange={handleCodeChange}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        theme="vs-dark"
        value={data.content?.text}
      />
    </NodeLayout>
  );
};
