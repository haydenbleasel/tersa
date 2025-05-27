'use client';

import { cn } from '@/lib/utils';
import { ReasoningTunnel, useReasoning } from '@/tunnels/reasoning';

export const Reasoning = () => {
  const [reasoning] = useReasoning();

  return (
    <div
      className={cn(
        'fixed top-4 right-4 bottom-4 w-sm border bg-background p-5',
        reasoning ? 'block' : 'hidden'
      )}
    >
      <ReasoningTunnel.Out />
    </div>
  );
};
