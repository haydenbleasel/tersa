import { ClientOnly } from '@/providers/client';
import { ReactFlowProvider } from '@xyflow/react';
import { CanvasInner, type CanvasProps } from './inner';

export const Canvas = ({ projects, data, userId }: CanvasProps) => (
  <ReactFlowProvider>
    <ClientOnly>
      <CanvasInner projects={projects} data={data} userId={userId} />
    </ClientOnly>
  </ReactFlowProvider>
);
