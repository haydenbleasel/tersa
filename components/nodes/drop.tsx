import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { nodeButtons } from '@/lib/node-buttons';
import { type XYPosition, useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import { NodeLayout } from './layout';

type DropNodeProps = {
  data: {
    isSource?: boolean;
    position: XYPosition;
  };
  id: string;
};

export const DropNode = ({ data, id }: DropNodeProps) => {
  const { addNodes, deleteElements, getNode, addEdges, getNodeConnections } =
    useReactFlow();
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (type: string, options?: Record<string, unknown>) => {
    // Get the position of the current node
    const currentNode = getNode(id);
    const position = currentNode?.position || { x: 0, y: 0 };
    const sourceNodes = getNodeConnections({
      nodeId: id,
    });

    // Delete the drop node
    deleteElements({
      nodes: [{ id }],
    });

    const newNodeId = nanoid();
    const { data: nodeData, ...rest } = options ?? {};

    // Add the new node of the selected type
    addNodes({
      id: newNodeId,
      type,
      position,
      data: {
        ...(nodeData ? nodeData : {}),
      },
      origin: [0, 0.5],
      ...rest,
    });

    for (const sourceNode of sourceNodes) {
      addEdges({
        id: nanoid(),
        source: data.isSource ? newNodeId : sourceNode.source,
        target: data.isSource ? sourceNode.source : newNodeId,
        type: 'animated',
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Delete the drop node when Escape is pressed
        deleteElements({
          nodes: [{ id }],
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      // Get the DOM element for this node
      const nodeElement = ref.current;

      // Check if the click was outside the node
      if (nodeElement && !nodeElement.contains(event.target as Node)) {
        deleteElements({
          nodes: [{ id }],
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    setTimeout(() => {
      window.addEventListener('click', handleClick);
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [deleteElements, id]);

  return (
    <div ref={ref}>
      <NodeLayout id={id} data={data} type="drop" title="Add a new node">
        <Command className="rounded-lg">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Add node">
              {nodeButtons
                .filter(
                  (button) => button.id !== 'file' && button.id !== 'tweet'
                )
                .map((button) => (
                  <CommandItem
                    key={button.id}
                    onSelect={() => handleSelect(button.id, button.data)}
                  >
                    <button.icon size={16} />
                    {button.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </NodeLayout>
    </div>
  );
};
