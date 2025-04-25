import { ReactFlowProvider } from '@xyflow/react';
import { CanvasInner, type CanvasProps } from './inner';

export const Canvas = ({ projects, data, userId }: CanvasProps) => (
  <ReactFlowProvider>
    <CanvasInner projects={projects} data={data} userId={userId} />
  </ReactFlowProvider>
);
