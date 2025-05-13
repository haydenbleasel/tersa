'use client';

import { useRealtime } from '@/providers/realtime';
import { Cursor } from './cursor';

export const RealtimeCursors = () => {
  const { cursors } = useRealtime();

  return Object.keys(cursors).map((id) => (
    <Cursor key={id} data={cursors[id]} />
  ));
};
