'use client';

import { uploadFile } from '@/lib/upload';
import { cn } from '@/lib/utils';
import { useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNodeOperations } from './node-operations';

type NodeDropzoneProviderProps = {
  children: ReactNode;
};

export const NodeDropzoneProvider = ({
  children,
}: NodeDropzoneProviderProps) => {
  const { getViewport } = useReactFlow();
  const { addNode } = useNodeOperations();
  const dropzone = useDropzone({
    noClick: true,
    autoFocus: false,
    noKeyboard: true,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
    },
    onDrop: async (acceptedFiles) => {
      const uploads = await Promise.all(
        acceptedFiles.map((file) => uploadFile(file, 'files'))
      );

      // Get the current viewport
      const viewport = getViewport();

      // Calculate the center of the current viewport
      const centerX =
        -viewport.x / viewport.zoom + window.innerWidth / 2 / viewport.zoom;
      const centerY =
        -viewport.y / viewport.zoom + window.innerHeight / 2 / viewport.zoom;

      for (const { url, type } of uploads) {
        const nodeType = type.split('/')[0];

        addNode(nodeType, {
          data: {
            content: {
              url,
              type,
            },
          },
          position: {
            x: centerX,
            y: centerY,
          },
        });
      }
    },
  });

  return (
    <div {...dropzone.getRootProps()} className="size-full">
      <input
        {...dropzone.getInputProps()}
        className="pointer-events-none hidden select-none"
      />
      <div
        className={cn(
          'absolute inset-0 z-[999999] flex items-center justify-center bg-foreground/50 text-primary backdrop-blur-xl transition-all',
          dropzone.isDragActive
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        <p className="text-2xl text-background">Drop files to create nodes</p>
      </div>
      {children}
    </div>
  );
};
