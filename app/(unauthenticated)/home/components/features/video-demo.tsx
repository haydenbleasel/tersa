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
    id: 'primitive-2',
    type: 'image',
    position: { x: 0, y: 300 },
    data: {
      source: 'primitive',
      content: {
        url: '/demo/delphiniums-anime.jpg',
        type: 'image/jpeg',
      },
    },
    origin: [0, 0.5],
  },
  {
    id: 'transform-1',
    type: 'video',
    position: { x: 600, y: 200 },
    data: {
      source: 'transform',
      generated: {
        url: '/demo/delphiniums.mp4',
        type: 'video/mp4',
      },
      instructions: 'Make the flowers move softly in the wind.',
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
  {
    id: 'edge-2',
    source: 'primitive-2',
    target: 'transform-1',
    type: 'animated',
  },
];

export const VideoDemo = () => (
  <Canvas
    data={{
      createdAt: new Date(),
      id: 'video-demo',
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
