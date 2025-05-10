import { NodeToolbar as NodeToolbarRaw } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { CodeIcon, EyeIcon, TrashIcon } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type NodeToolbarProps = {
  id: string;
  data: {
    forceToolbarVisible?: boolean;
  };
  items:
    | {
        tooltip?: string;
        children: ReactNode;
      }[]
    | undefined;
  onFocus?: () => void;
  onDelete?: () => void;
};

export const NodeToolbar = ({
  id,
  data,
  items,
  onFocus,
  onDelete,
}: NodeToolbarProps) => (
  <NodeToolbarRaw
    isVisible={data?.forceToolbarVisible || undefined}
    position={Position.Bottom}
    className="flex items-center gap-1 rounded-full border bg-background/90 p-1 drop-shadow-xs backdrop-blur-sm"
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onFocus}
        >
          <EyeIcon size={12} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Focus</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
        >
          <TrashIcon size={12} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Delete</TooltipContent>
    </Tooltip>
    {process.env.NODE_ENV === 'development' && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <CodeIcon size={12} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[600px] text-wrap">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({ id, data }, null, 2)}
          </pre>
        </TooltipContent>
      </Tooltip>
    )}
  </NodeToolbarRaw>
);
