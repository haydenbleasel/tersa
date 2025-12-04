"use client";

import { Panel, useReactFlow } from "@xyflow/react";
import { memo } from "react";
import { nodeButtons } from "@/lib/node-buttons";
import { useNodeOperations } from "@/providers/node-operations";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
      },
      ...rest,
    });
  };

  return (
    <Panel
      className="m-4 flex items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm"
      position="bottom-center"
    >
      {nodeButtons.map((button) => (
        <Tooltip key={button.id}>
          <TooltipTrigger asChild>
            <Button
              className="rounded-full"
              onClick={() => handleAddNode(button.id, button.data)}
              size="icon"
              variant="ghost"
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
