import { useNodeOperations } from '@/providers/node-operations';
import { Panel, useReactFlow } from '@xyflow/react';
import {
  AudioWaveformIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  TextIcon,
  VideoIcon,
} from 'lucide-react';
import { memo } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export const ToolbarInner = () => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();

  const handleAddNode = (type: string, options?: Record<string, unknown>) => {
    // Get the current viewport
    const viewport = getViewport();

    // Calculate the center of the current viewport
    const centerX =
      -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
    const centerY =
      -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

    const position = { x: centerX, y: centerY };
    const { data: nodeData, ...rest } = options ?? {};

    addNode(type, {
      position,
      data: {
        ...(nodeData ? nodeData : {}),
        source: 'primitive',
      },
      ...rest,
    });
  };

  const buttons = [
    {
      id: 'text',
      label: 'Text',
      icon: TextIcon,
      onClick: () => handleAddNode('text'),
    },
    {
      id: 'image',
      label: 'Image',
      icon: ImageIcon,
      onClick: () => handleAddNode('image'),
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: AudioWaveformIcon,
      onClick: () => handleAddNode('audio'),
    },
    {
      id: 'video',
      label: 'Video',
      icon: VideoIcon,
      onClick: () => handleAddNode('video'),
    },
    {
      id: 'code',
      label: 'Code',
      icon: CodeIcon,
      onClick: () =>
        handleAddNode('code', {
          data: {
            content: { language: 'javascript' },
          },
        }),
    },
    {
      id: 'file',
      label: 'File',
      icon: FileIcon,
      onClick: () => handleAddNode('file'),
    },
  ];

  return (
    <Panel
      position="bottom-center"
      className="m-4 flex items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm"
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

export const Toolbar = memo(ToolbarInner);
