'use client';

import { nodeButtons } from '@/lib/node-buttons';
import { useNodeOperations } from '@/providers/node-operations';
import { Panel, useReactFlow } from '@xyflow/react';
import { memo } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const ToolbarInner = () => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();

  const handleAddNode = (type: string, options?: Record<string, unknown>) => {
    // Get the current viewport
    const viewport = getViewport();

    // Calculate the center of the current viewport
    const centerX =
      -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
    const centerY =
      -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

    const position = { x: centerX, y: centerY };
    const { data: nodeData, ...rest } = options ?? {};

    addNode(type, {
      position,
      data: {
        ...(nodeData ? nodeData : {}),
        source: 'primitive',
      },
      ...rest,
    });
  };

  return (
    <Panel
      position="bottom-center"
      className="m-4 flex items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm"
    >
      {nodeButtons.map((button) => (
        <Tooltip key={button.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => handleAddNode(button.id, button.data)}
            >
              <button.icon size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{button.label}</TooltipContent>
        </Tooltip>
      ))}
    </Panel>
  );
};

export const Toolbar = memo(ToolbarInner);
