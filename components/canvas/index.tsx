import { ReactFlowProvider } from '@xyflow/react';
import type { CanvasProps } from './canvas';
import { Canvas as CanvasComponent } from './canvas';

export const Canvas = (props: CanvasProps) => (
  <ReactFlowProvider>
    <CanvasComponent {...props} />
  </ReactFlowProvider>
);
