'use client';
import { Canvas } from '@/components/canvas';
import type { Edge, Node } from '@xyflow/react';

const sampleNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'output',
    data: { label: 'Node 2' },
    position: { x: 100, y: 0 },
  },
];

const sampleEdges: Edge[] = [{ id: '1', source: '1', target: '2' }];

export const Demo = () => {
  return (
    <div className="h-screen w-screen">
      <Canvas
        projects={[]}
        data={{
          createdAt: new Date(),
          id: -1,
          name: 'Demo Project',
          userId: 'test',
          transcriptionModel: 'gpt-4o-mini-transcribe',
          visionModel: 'gpt-4.1-nano',
          updatedAt: null,
          organizationId: null,
          image: null,
        }}
        defaultContent={{
          nodes: sampleNodes,
          edges: sampleEdges,
        }}
      />
    </div>
  );
};
