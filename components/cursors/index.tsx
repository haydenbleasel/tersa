'use client';

import { useRealtimeCursors } from '@/hooks/use-realtime-cursors';
import { Cursor } from './cursor';

const THROTTLE_MS = 50;

export const RealtimeCursors = ({ roomName }: { roomName: string }) => {
  const { cursors } = useRealtimeCursors({ roomName, throttleMs: THROTTLE_MS });

  return (
    <div>
      {Object.keys(cursors).map((id) => (
        <Cursor key={id} data={cursors[id]} />
      ))}
    </div>
  );
};
