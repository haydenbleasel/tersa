import { Canvas } from '@/components/canvas';
import { sampleEdges, sampleNodes, sampleViewport } from '@/lib/demo';
import { ReactFlowProvider } from '@xyflow/react';

export const Demo = () => (
  <section className="container mx-auto px-4 sm:px-8">
    <div className="rounded-lg bg-gradient-to-b from-primary to-border p-px">
      <div className="aspect-video overflow-hidden rounded-[9px]">
        <ReactFlowProvider>
          <Canvas
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
              members: [],
              welcomeProject: false,
            }}
            canvasProps={{
              panOnScroll: false,
              panOnDrag: true,
              zoomOnScroll: false,
              preventScrolling: false,
            }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  </section>
);
