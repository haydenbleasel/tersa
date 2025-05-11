'use client'

import { useReactFlow } from '@xyflow/react'
import { Cursor } from './cursor'
import { useRealtimeCursors } from '@/hooks/use-realtime-cursors'

const THROTTLE_MS = 50

export const RealtimeCursors = ({ roomName }: { roomName: string }) => {
  const { cursors } = useRealtimeCursors({ roomName, throttleMs: THROTTLE_MS });
  const { flowToScreenPosition } = useReactFlow();

  return (
    <div>
      {Object.keys(cursors).map((id) => (
        <Cursor
          key={id}
          className="fixed transition-transform ease-in-out z-50"
          style={{
            transitionDuration: '20ms',
            top: 0,
            left: 0,
            transform: `translate(${flowToScreenPosition(cursors[id].position).x}px, ${flowToScreenPosition(cursors[id].position).y}px)`,
          }}
          color={cursors[id].color}
          name={cursors[id].user.name}
          avatar={cursors[id].user.avatar}
        />
      ))}
    </div>
  )
}
