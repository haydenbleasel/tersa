import { type Node, Panel, useReactFlow } from '@xyflow/react';
import {
  AudioWaveformIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const Toolbar = () => {
  const { addNodes, getViewport } = useReactFlow();

  const addNode = (type: string, options?: Record<string, unknown>) => {
    // Get the current viewport
    const viewport = getViewport();

    // Calculate the center of the current viewport
    const centerX =
      -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
    const centerY =
      -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

    const position = { x: centerX, y: centerY };
    const { data: nodeData, ...rest } = options ?? {};

    const newNode: Node = {
      id: nanoid(),
      type,
      data: {
        ...(nodeData ? nodeData : {}),
        source: 'primitive',
      },
      position,
      origin: [0, 0.5],
      ...rest,
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
      id: 'code',
      label: 'Code',
      icon: CodeIcon,
      onClick: () =>
        addNode('code', {
          data: {
            content: { language: 'javascript' },
          },
        }),
    },
    {
      id: 'file',
      label: 'File',
      icon: FileIcon,
      onClick: () => addNode('file'),
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
