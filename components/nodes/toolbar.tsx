import {
  NodeToolbar as NodeToolbarRaw,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { Fragment, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type NodeToolbarProps = {
  id: string;
  items:
    | {
        tooltip?: string;
        children: ReactNode;
      }[]
    | undefined;
};

export const NodeToolbar = ({ id, items }: NodeToolbarProps) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);

  return (
    <NodeToolbarRaw
      className="flex items-center gap-1 rounded-full bg-background/40 p-1.5 backdrop-blur-sm"
      isVisible={node?.selected}
      position={Position.Bottom}
    >
      {items?.map((button, index) =>
        button.tooltip ? (
          <Tooltip key={button.tooltip}>
            <TooltipTrigger asChild>{button.children}</TooltipTrigger>
            <TooltipContent>{button.tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: No unique identifier available for buttons without tooltip
          <Fragment key={index}>{button.children}</Fragment>
        )
      )}
    </NodeToolbarRaw>
  );
};
