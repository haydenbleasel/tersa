import {
  Handle,
  NodeResizeControl,
  NodeToolbar,
  Position,
  useReactFlow,
} from '@xyflow/react';
import {
  BrainIcon,
  CodeIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type NodeLayoutProps = {
  children: ReactNode;
  id: string;
  data?: Record<string, unknown> & {
    model?: string;
    source?: string;
    content?: object;
    forceToolbarVisible?: boolean;
    toolbarPosition?: Position;
  };
  title: string;
  type: string;
  toolbar?: {
    tooltip?: string;
    children: ReactNode;
  }[];
};

export const NodeLayout = ({
  children,
  type,
  id,
  data,
  toolbar,
  title,
}: NodeLayoutProps) => {
  const { deleteElements, setCenter, getNode, updateNodeData } = useReactFlow();

  const handleDelete = () => {
    deleteElements({
      nodes: [{ id }],
    });
  };

  const handleFocus = () => {
    const node = getNode(id);

    if (!node) {
      return;
    }

    const { x, y } = node.position;
    const width = node.measured?.width ?? 0;
    const height = node.measured?.height ?? 0;

    setCenter(x + width / 2, y + height / 2, {
      duration: 1000,
    });
  };

  const handleSourceChange = (value: boolean) =>
    updateNodeData(id, {
      source: value ? 'transform' : 'primitive',
    });

  return (
    <>
      {type !== 'drop' && (
        <NodeToolbar
          isVisible={data?.forceToolbarVisible || undefined}
          position={data?.toolbarPosition}
          className="flex items-center gap-1 rounded-full border bg-background/90 p-1 drop-shadow-xs backdrop-blur-sm"
        >
          {toolbar?.map((button, index) =>
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
                onClick={handleFocus}
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
                onClick={handleDelete}
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
                  {JSON.stringify({ id, data, type, title }, null, 2)}
                </pre>
              </TooltipContent>
            </Tooltip>
          )}
        </NodeToolbar>
      )}
      <NodeResizeControl
        minWidth={400}
        minHeight={170}
        keepAspectRatio={type === 'image' || type === 'video'}
      />
      <Handle type="target" position={Position.Left} />
      <div className="relative size-full">
        <div className="-translate-y-full -top-2 absolute right-0 left-0 flex shrink-0 items-center justify-between">
          <p className="font-mono text-muted-foreground text-xs tracking-tighter">
            {title}
          </p>
          <div className="flex items-center gap-2">
            <UserIcon size={12} className="text-muted-foreground" />
            <Switch
              checked={data?.source === 'transform'}
              onCheckedChange={handleSourceChange}
            />
            <BrainIcon size={12} className="text-muted-foreground" />
          </div>
        </div>
        <div className="node-container flex size-full flex-col divide-y rounded-lg bg-card ring-1 ring-border transition-all">
          {children}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};
