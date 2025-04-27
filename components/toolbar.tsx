import { type Node, Panel, type XYPosition, useReactFlow } from '@xyflow/react';
import {
  AudioWaveformIcon,
  ImageIcon,
  MessageSquareIcon,
  TextIcon,
  VideoIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const Toolbar = () => {
  const { addNodes } = useReactFlow();

  const addNode = (
    type: string,
    position?: XYPosition,
    data?: Record<string, unknown>
  ) => {
    const newNode: Node = {
      id: nanoid(),
      type,
      data: {
        source: 'primitive',
        ...data,
      },
      position: position ?? { x: 0, y: 0 },
      origin: [0, 0.5],
    };

    addNodes([newNode]);
  };

  const buttons = [
    {
      id: 'text',
      label: 'Text',
      icon: TextIcon,
      onClick: () => addNode('text'),
    },
    {
      id: 'image',
      label: 'Image',
      icon: ImageIcon,
      onClick: () => addNode('image'),
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: AudioWaveformIcon,
      onClick: () => addNode('audio'),
    },
    {
      id: 'video',
      label: 'Video',
      icon: VideoIcon,
      onClick: () => addNode('video'),
    },
    {
      id: 'comment',
      label: 'Comment',
      icon: MessageSquareIcon,
      onClick: () => addNode('comment'),
    },
  ];

  return (
    <Panel
      position="bottom-center"
      className="flex items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm"
    >
      {buttons.map((button) => (
        <Tooltip key={button.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={button.onClick}
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
