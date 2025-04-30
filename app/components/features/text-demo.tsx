import { Canvas } from '@/components/canvas';
import type { Edge, Node } from '@xyflow/react';

const nodes: Node[] = [
  {
    id: 'primitive-1',
    type: 'text',
    position: { x: 50, y: 100 },
    data: {
      source: 'primitive',
      text: 'Say hello',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: 'rgb(31, 31, 31)' },
                  },
                ],
                text: 'Say hello',
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'primitive-2',
    type: 'text',
    position: { x: 50, y: 200 },
    data: {
      source: 'primitive',
      text: 'In French',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: 'rgb(31, 31, 31)' },
                  },
                ],
                text: 'In French',
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'transform-1',
    type: 'text',
    position: { x: 300, y: 100 },
    data: {
      source: 'transform',
      model: 'gpt-4o',
      instructions: 'Add some flair to the text',
      generated: ['Bonjour!'],
    },
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

export const TextDemo = () => (
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
      },
    }}
  />
);
