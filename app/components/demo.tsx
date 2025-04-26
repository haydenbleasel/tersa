'use client';

import { Canvas } from '@/components/canvas';
import { RealtimeCursors } from '@/components/supabase-ui/realtime-cursors';
import { sampleEdges, sampleNodes, sampleViewport } from '@/lib/demo';

export const Demo = () => (
  <div className="h-screen w-screen">
    <RealtimeCursors roomName="demo" username="Demo user" />
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
        content: {
          nodes: sampleNodes,
          edges: sampleEdges,
          viewport: sampleViewport,
        },
      }}
    />
  </div>
);
