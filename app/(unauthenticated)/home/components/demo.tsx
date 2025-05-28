import { Canvas } from '@/components/canvas';
import { sampleEdges, sampleNodes } from '@/lib/demo';
import { ReactFlowProvider } from '@xyflow/react';

export const Demo = () => (
  <section className="container mx-auto px-4 sm:px-8">
    <div className="rounded-lg bg-gradient-to-b from-primary to-border p-px">
      <div className="aspect-video overflow-hidden rounded-[9px]">
        <ReactFlowProvider>
          <Canvas
            nodes={sampleNodes}
            edges={sampleEdges}
            panOnScroll={false}
            zoomOnScroll={false}
            preventScrolling={false}
            fitViewOptions={{
              minZoom: 0,
            }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  </section>
);
