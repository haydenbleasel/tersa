import { useReactFlow } from "@xyflow/react";
import { Fragment, type ReactNode } from "react";
import { Toolbar } from "../ai-elements/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface NodeToolbarProps {
  id: string;
  items:
    | {
        tooltip?: string;
        children: ReactNode;
      }[]
    | undefined;
}

export const NodeToolbar = ({ id, items }: NodeToolbarProps) => {
  const { getNode } = useReactFlow();
  const node = getNode(id);

  return (
    <Toolbar className="rounded-full" isVisible={node?.selected}>
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
    </Toolbar>
  );
};
