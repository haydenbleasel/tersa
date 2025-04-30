import { Canvas } from '@/components/canvas';
import type { Edge, Node } from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'primitive-1',
    type: 'code',
    position: { x: 0, y: 0 },
    data: {
      source: 'primitive',
      text: 'A wild orchard of delphiniums',
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 290 },
    width: 400,
    height: 290,
  },
  {
    id: 'transform-1',
    type: 'code',
    position: { x: 400, y: 0 },
    data: {
      source: 'transform',
      generated: {
        url: '/demo/delphiniums-anime.jpg',
        type: 'image/jpeg',
      },
      instructions: 'Make it anime style.',
    },
    origin: [0, 0.5],
    measured: { width: 400, height: 290 },
    width: 400,
    height: 290,
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

export const CodeDemo = () => (
  <Canvas
    projects={[]}
    data={{
      createdAt: new Date(),
      id: 'demo',
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
    }}
    canvasProps={{
      panOnScroll: false,
      zoomOnScroll: false,
      preventScrolling: false,
      fitViewOptions: {
        minZoom: 0,
        padding: 0.2,
      },
    }}
  />
);
