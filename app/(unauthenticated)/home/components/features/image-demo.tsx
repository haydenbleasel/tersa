import { type Edge, type Node, ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/components/canvas";

const nodes: Node[] = [
  {
    id: "primitive-1",
    type: "text",
    position: { x: 0, y: 0 },
    data: {
      text: "A wild field of delphiniums",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "A wild field of delphiniums",
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "transform-1",
    type: "image",
    position: { x: 600, y: 0 },
    data: {
      generated: {
        url: "/demo/delphiniums-anime.jpg",
        type: "image/jpeg",
      },
      instructions: "Make it anime style.",
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

export const ImageDemo = () => (
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
