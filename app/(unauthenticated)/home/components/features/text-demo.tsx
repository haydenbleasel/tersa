import { type Edge, type Node, ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/components/canvas";

const nodes: Node[] = [
  {
    id: "primitive-1",
    type: "text",
    position: { x: 0, y: 0 },
    data: {
      text: "Say hello",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Say hello",
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "primitive-2",
    type: "text",
    position: { x: 0, y: 200 },
    data: {
      text: "In French",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "In French",
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "transform-1",
    type: "text",
    position: { x: 600, y: 100 },
    data: {
      instructions: "Add some flair to the text",
      generated: {
        text: "Bonjour!",
      },
    },
  },
];

const edges: Edge[] = [
  {
    id: "edge-1",
    source: "primitive-1",
    target: "transform-1",
    type: "animated",
  },
  {
    id: "edge-2",
    source: "primitive-2",
    target: "transform-1",
    type: "animated",
  },
];

export const TextDemo = () => (
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
