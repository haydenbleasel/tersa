import { ReactFlowProvider } from '@xyflow/react';
import { CanvasInner, type CanvasProps } from './inner';

export const Canvas = (props: CanvasProps) => (
  <ReactFlowProvider>
    <CanvasInner {...props} />
  </ReactFlowProvider>
);
