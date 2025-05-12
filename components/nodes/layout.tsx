import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ContextMenuSeparator } from '@radix-ui/react-context-menu';
import { Handle, type Node, Position, useReactFlow } from '@xyflow/react';
import {
  BrainIcon,
  CopyIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import type { ReactNode } from 'react';
import { Switch } from '../ui/switch';
import { NodeToolbar } from './toolbar';

type NodeLayoutProps = {
  children: ReactNode;
  id: string;
  data?: Record<string, unknown> & {
    model?: string;
    source?: string;
    generated?: object;
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
  const { deleteElements, setCenter, getNode, updateNodeData, addNodes } =
    useReactFlow();

  const handleSourceChange = (value: boolean) =>
    updateNodeData(id, {
      source: value ? 'transform' : 'primitive',
    });

  const handleDuplicate = () => {
    const node = getNode(id);

    if (!node) {
      return;
    }

    const { id: oldId, ...rest } = node;

    const newNode: Node = {
      id: nanoid(),
      ...rest,
      position: {
        x: node.position.x + 200,
        y: node.position.y + 200,
      },
    };

    addNodes([newNode]);
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

  const handleDelete = () => {
    deleteElements({
      nodes: [{ id }],
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {type !== 'drop' && (
          <NodeToolbar
            id={id}
            data={data as never}
            items={toolbar}
            onFocus={handleFocus}
            onDelete={handleDelete}
          />
        )}
        {type !== 'file' && <Handle type="target" position={Position.Left} />}
        <div className="relative size-full h-auto w-sm">
          {type !== 'drop' && (
            <div className="-translate-y-full -top-2 absolute right-0 left-0 flex shrink-0 items-center justify-between">
              <p className="font-mono text-muted-foreground text-xs tracking-tighter">
                {title}
              </p>
              {type !== 'file' && (
                <div className="flex items-center gap-2">
                  <UserIcon size={12} className="text-muted-foreground" />
                  <Switch
                    checked={data?.source === 'transform'}
                    onCheckedChange={handleSourceChange}
                  />
                  <BrainIcon size={12} className="text-muted-foreground" />
                </div>
              )}
            </div>
          )}
          <div className="node-container flex size-full flex-col divide-y rounded-[28px] bg-card p-2 shadow-2xl shadow-black/10 ring-1 ring-border transition-all">
            <div className="overflow-hidden rounded-3xl bg-card">
              {children}
            </div>
          </div>
        </div>
        <Handle type="source" position={Position.Right} />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDuplicate}>
          <CopyIcon size={12} />
          <span>Duplicate</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleFocus}>
          <EyeIcon size={12} />
          <span>Focus</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} variant="destructive">
          <TrashIcon size={12} />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
