'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CursorBody,
  Cursor as CursorComponent,
  CursorName,
  CursorPointer,
} from '@/components/ui/kibo-ui/cursor';
import { usePerfectCursor } from '@/hooks/use-perfect-cursor';
import type { CursorEventPayload } from '@/hooks/use-realtime-cursors';
import { useReactFlow } from '@xyflow/react';
import { useCallback, useLayoutEffect, useRef } from 'react';

type CursorProps = {
  data: CursorEventPayload;
};

export const Cursor = ({ data }: CursorProps) => {
  const { flowToScreenPosition } = useReactFlow();
  const rCursor = useRef<HTMLDivElement>(null);

  const animateCursor = useCallback((point: number[]) => {
    if (rCursor.current) {
      rCursor.current.dataset.x = point[0].toString();
      rCursor.current.dataset.y = point[1].toString();
    }
  }, []);

  const onPointMove = usePerfectCursor(animateCursor);

  useLayoutEffect(() => {
    const { x, y } = flowToScreenPosition(data.position);

    onPointMove([x, y]);
  }, [onPointMove, data.position, flowToScreenPosition]);

  return (
    <div
      ref={rCursor}
      className="pointer-events-none fixed top-0 left-0 z-50 select-none"
      style={{
        transform: `translate(${rCursor.current?.dataset.x || 0}px, ${rCursor.current?.dataset.y || 0}px)`,
        transition: 'transform 20ms ease-in-out',
      }}
    >
      <CursorComponent className="relative">
        <CursorPointer className="size-5" style={{ color: data.color }} />
        <CursorBody
          className="flex-row items-center gap-2 py-1.5 font-semibold text-sm text-white"
          style={{ backgroundColor: data.color }}
        >
          <Avatar className="h-4 w-4 rounded-full">
            <AvatarImage src={data.user.avatar} />
            <AvatarFallback>
              {data.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CursorName>{data.user.name}</CursorName>
            {/* <CursorMessage>{cursors[id].message}</CursorMessage> */}
          </div>
        </CursorBody>
      </CursorComponent>
    </div>
  );
};
