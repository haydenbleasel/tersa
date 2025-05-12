import { useUser } from '@/hooks/use-user';
import { useProject } from '@/providers/project';
import { NodeToolbar as NodeToolbarRaw, useReactFlow } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { Fragment, type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
  const { project } = useProject();
  const user = useUser();
  const editable = project?.userId === user?.id;

  return (
    <NodeToolbarRaw
      isVisible={node?.selected && editable}
      position={Position.Bottom}
      className="flex items-center gap-1 rounded-full bg-background/40 p-1.5 backdrop-blur-sm"
    >
      {items?.map((button, index) =>
        button.tooltip ? (
          <Tooltip key={button.tooltip}>
            <TooltipTrigger asChild>{button.children}</TooltipTrigger>
            <TooltipContent>{button.tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <Fragment key={index}>{button.children}</Fragment>
        )
      )}
    </NodeToolbarRaw>
  );
};
