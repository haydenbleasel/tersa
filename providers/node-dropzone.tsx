'use client';

import { uploadFile } from '@/lib/upload';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';

type NodeDropzoneProviderProps = {
  addNode: (nodeType: string, options?: Record<string, unknown>) => void;
  children: ReactNode;
};

export const NodeDropzoneProvider = ({
  addNode,
  children,
}: NodeDropzoneProviderProps) => {
  const dropzone = useDropzone({
    noClick: true,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
    },
    onDrop: async (acceptedFiles) => {
      const uploads = await Promise.all(
        acceptedFiles.map((file) => uploadFile(file, 'files'))
      );

      for (const { url, type } of uploads) {
        const nodeType = type.split('/')[0];

        addNode(nodeType, {
          data: {
            content: {
              url,
              type,
            },
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
