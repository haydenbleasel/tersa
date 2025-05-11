'use client'

import { useReactFlow } from '@xyflow/react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Cursor, CursorPointer, CursorBody, CursorName, CursorMessage } from '@/components/ui/kibo-ui/cursor';
import { useRealtimeCursors } from '@/hooks/use-realtime-cursors'

const THROTTLE_MS = 50

export const RealtimeCursors = ({ roomName }: { roomName: string }) => {
  const { cursors } = useRealtimeCursors({ roomName, throttleMs: THROTTLE_MS });
  const { flowToScreenPosition } = useReactFlow();

  return (
    <div>
      {Object.keys(cursors).map((id) => (
        <Cursor key={id}
          className="fixed pointer-events-none transition-transform ease-in-out z-50 top-0 left-0 duration-[20ms]"
          style={{
            transform: `translate(${flowToScreenPosition(cursors[id].position).x}px, ${flowToScreenPosition(cursors[id].position).y}px)`,
          }}>
            <CursorPointer className="size-5" style={{ color: cursors[id].color }} />
            <CursorBody className="text-white py-1.5 text-sm font-semibold items-center flex-row gap-2" style={{ backgroundColor: cursors[id].color }}>
              <Avatar className="w-4 h-4 rounded-full">
                <AvatarImage src={cursors[id].user.avatar} />
                <AvatarFallback>{cursors[id].user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CursorName>{cursors[id].user.name}</CursorName>
                {/* <CursorMessage>{cursors[id].message}</CursorMessage> */}
              </div>
            </CursorBody>
          </Cursor>
      ))}
    </div>
  )
}
