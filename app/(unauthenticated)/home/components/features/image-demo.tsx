import { Canvas } from '@/components/canvas';
import type { Edge, Node } from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'primitive-1',
    type: 'text',
    position: { x: 0, y: 0 },
    data: {
      source: 'primitive',
      text: 'A wild orchard of delphiniums',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'A wild orchard of delphiniums',
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'transform-1',
    type: 'image',
    position: { x: 600, y: 0 },
    data: {
      source: 'transform',
      generated: {
        url: '/demo/delphiniums-anime.jpg',
        type: 'image/jpeg',
      },
      instructions: 'Make it anime style.',
    },
    origin: [0, 0.5],
  },
];

const edges: Edge[] = [
  {
    id: 'edge-1',
    source: 'primitive-1',
    target: 'transform-1',
    type: 'animated',
  },
];

export const ImageDemo = () => (
  <Canvas
    data={{
      createdAt: new Date(),
      id: 'image-demo',
      name: 'Demo Project',
      userId: 'test',
      transcriptionModel: 'gpt-4o-mini-transcribe',
      visionModel: 'gpt-4.1-nano',
      updatedAt: null,
      image: null,
      content: {
        nodes,
        edges,
      },
      members: [],
    }}
    canvasProps={{
      panOnScroll: false,
      zoomOnScroll: false,
      preventScrolling: false,
      fitViewOptions: {
        minZoom: 0,
      },
    }}
  />
);
