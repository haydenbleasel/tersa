import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { type XYPosition, useReactFlow } from '@xyflow/react';
import {
  AudioWaveformIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { NodeLayout } from './layout';

type DropNodeProps = {
  data: {
    position: XYPosition;
  };
  id: string;
};

const buttons = [
  {
    id: 'text',
    label: 'Text',
    icon: TextIcon,
  },
  {
    id: 'image',
    label: 'Image',
    icon: ImageIcon,
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: AudioWaveformIcon,
  },
  {
    id: 'video',
    label: 'Video',
    icon: VideoIcon,
  },
];

export const DropNode = ({ data, id }: DropNodeProps) => {
  const { addNodes, deleteElements, getNode, addEdges, getNodeConnections } =
    useReactFlow();

  const handleSelect = (type: string) => {
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

    // Add the new node of the selected type
    addNodes({
      id: newNodeId,
      type,
      position,
      data: {
        source: 'transform',
      },
      origin: [0, 0.5],
    });

    for (const sourceNode of sourceNodes) {
      addEdges({
        id: nanoid(),
        source: sourceNode.source,
        target: newNodeId,
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

    // Add event listener for escape key
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteElements, id]);

  return (
    <NodeLayout id={id} data={data} type="drop" title="Add a new node">
      <Command className="rounded-lg">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Add node">
            {buttons.map((button) => (
              <CommandItem
                key={button.id}
                onSelect={() => handleSelect(button.id)}
              >
                <button.icon size={16} />
                {button.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </NodeLayout>
  );
};
