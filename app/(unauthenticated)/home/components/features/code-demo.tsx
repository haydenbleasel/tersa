import { type Edge, type Node, ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/components/canvas";

const nodes: Node[] = [
  {
    id: "primitive-1",
    type: "code",
    position: { x: 0, y: 0 },
    data: {
      content: {
        text: "export const getTextFromTextNodes = (nodes) => {\n  return nodes\n    .filter((node) => node.type === 'text')\n    .map((node) => node.data.text)\n    .filter(Boolean)\n    .join('\\n');\n};",
        language: "javascript",
      },
    },
    origin: [0, 0.5],
  },
  {
    id: "transform-1",
    type: "code",
    position: { x: 600, y: 100 },
    data: {
      generated: {
        text: "import { getTextFromTextNodes } from './your-file';\n\ndescribe('getTextFromTextNodes', () => {\n  it('should return text from text nodes', () => {\n    const nodes = [\n      { type: 'text', data: { text: 'Hello' } },\n      { type: 'image', data: { url: 'image.jpg' } },\n      { type: 'text', data: { text: 'World' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('Hello\\nWorld');\n  });\n\n  it('should return empty string for non-text nodes', () => {\n    const nodes = [\n      { type: 'image', data: { url: 'image.jpg' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('');\n  });\n\n  it('should ignore nodes without text', () => {\n    const nodes = [\n      { type: 'text', data: { text: '' } },\n      { type: 'text', data: { text: 'Hello' } }\n    ];\n\n    const result = getTextFromTextNodes(nodes);\n    expect(result).toEqual('Hello');\n  });\n});",
        language: "javascript",
      },
      instructions: "Write unit tests.",
    },
    origin: [0, 0.5],
  },
];

const edges: Edge[] = [
  {
    id: "edge-1",
    source: "primitive-1",
    target: "transform-1",
    type: "animated",
  },
];

export const CodeDemo = () => (
  <ReactFlowProvider>
    <Canvas
      edges={edges}
      fitViewOptions={{
        minZoom: 0,
      }}
      nodes={nodes}
      panOnScroll={false}
      preventScrolling={false}
      zoomOnScroll={false}
    />
  </ReactFlowProvider>
);
