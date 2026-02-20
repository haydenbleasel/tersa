import type { Metadata } from "next";
import { Canvas } from "@/components/canvas";
import { Controls } from "@/components/controls";
import { Reasoning } from "@/components/reasoning";
import { Toolbar } from "@/components/toolbar";
import { GatewayProvider } from "@/providers/gateway";
import { ReactFlowProvider } from "../providers/react-flow";

export const metadata: Metadata = {
  title: "Tersa",
  description:
    "A visual AI playground. Drag, drop, connect and run nodes to build AI workflows powered by various industry-leading AI models.",
};

export const maxDuration = 800;

const Index = () => (
  <GatewayProvider>
    <ReactFlowProvider>
      <div className="flex h-screen w-screen items-stretch overflow-hidden">
        <div className="relative flex-1">
          <Canvas>
            <Controls />
            <Toolbar />
          </Canvas>
        </div>
        <Reasoning />
      </div>
    </ReactFlowProvider>
  </GatewayProvider>
);

export default Index;
