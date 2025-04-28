'use client';

import { Canvas } from '@/components/canvas';
import { sampleEdges, sampleNodes, sampleViewport } from '@/lib/demo';

export const Demo = () => (
  <div className="h-screen w-screen">
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
          nodes: sampleNodes,
          edges: sampleEdges,
          viewport: sampleViewport,
        },
      }}
    />
  </div>
);
