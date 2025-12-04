import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/components/canvas";
import { sampleEdges, sampleNodes } from "@/lib/demo";

export const Demo = () => (
  <section className="container mx-auto px-4 sm:px-8">
    <div className="rounded-lg bg-gradient-to-b from-primary to-border p-px">
      <div className="aspect-video overflow-hidden rounded-[9px]">
        <ReactFlowProvider>
          <Canvas
            edges={sampleEdges}
            fitViewOptions={{
              minZoom: 0,
            }}
            nodes={sampleNodes}
            panOnScroll={false}
            preventScrolling={false}
            zoomOnScroll={false}
          />
        </ReactFlowProvider>
      </div>
    </div>
  </section>
);
