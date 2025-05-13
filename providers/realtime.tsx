'use client';

import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useReactFlow } from '@xyflow/react';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const supabase = createClient();

type RealtimeUser = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

type CursorPosition = {
  x: number;
  y: number;
};

type CursorState = {
  position: CursorPosition;
  user: RealtimeUser;
  timestamp: number;
};

type RealtimeContextType = {
  users: Record<string, RealtimeUser>;
  cursors: Record<string, CursorState>;
  color: string;
  selectedNodes: Record<string, string>;
  channelRef: React.RefObject<RealtimeChannel | null>;
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

const colors = [
  'var(--color-red-500)',
  'var(--color-orange-500)',
  'var(--color-amber-500)',
  'var(--color-yellow-500)',
  'var(--color-lime-500)',
  'var(--color-green-500)',
  'var(--color-emerald-500)',
  'var(--color-teal-500)',
  'var(--color-cyan-500)',
  'var(--color-sky-500)',
  'var(--color-blue-500)',
  'var(--color-indigo-500)',
  'var(--color-purple-500)',
  'var(--color-fuchsia-500)',
  'var(--color-pink-500)',
  'var(--color-rose-500)',
];

const CURSOR_EVENT = 'cursor-move';
const NODE_SELECTION_EVENT = 'node-selection';

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({
  children,
  roomName,
  throttleMs = 50,
}: {
  children: ReactNode;
  roomName: string;
  throttleMs?: number;
}) => {
  const user = useUser();
  const { screenToFlowPosition } = useReactFlow();
  const [users, setUsers] = useState<Record<string, RealtimeUser>>({});
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});
  const [selectedNodes, setSelectedNodes] = useState<Record<string, string>>(
    {}
  );
  const [color] = useState(() => {
    if (user?.user_metadata?.color) {
      return user.user_metadata.color;
    }
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    if (user) {
      user.user_metadata = {
        ...user.user_metadata,
        color: newColor,
      };
    }
    return newColor;
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!user) {
        return;
      }

      const now = Date.now();
      const remainingTime = throttleMs - (now - lastCallRef.current);

      if (remainingTime <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        lastCallRef.current = now;

        const flowPosition = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const payload: CursorState = {
          position: flowPosition,
          user: {
            id: user.id,
            name: user.user_metadata.name ?? user.email ?? user.id,
            avatar: user.user_metadata.avatar,
            color,
          },
          timestamp: now,
        };

        channelRef.current?.send({
          type: 'broadcast',
          event: CURSOR_EVENT,
          payload,
        });
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          handleMouseMove(event);
        }, remainingTime);
      }
    },
    [color, screenToFlowPosition, throttleMs, user]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase.channel(roomName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<RealtimeUser>();
        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [key, values[0]])
        );
        setUsers(newUsers);
      })
      .on(
        'broadcast',
        { event: CURSOR_EVENT },
        ({ payload }: { payload: CursorState }) => {
          if (user.id === payload.user.id) {
            return;
          }

          setCursors((prev) => ({
            ...prev,
            [payload.user.id]: payload,
          }));
        }
      )
      .on(
        'broadcast',
        { event: NODE_SELECTION_EVENT },
        ({ payload }: { payload: { nodeId: string; userId: string } }) => {
          if (user.id === payload.userId) {
            return;
          }

          setSelectedNodes((prev) => ({
            ...prev,
            [payload.nodeId]: payload.userId,
          }));
        }
      )
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return;
        }

        await channel.track({
          id: user.id,
          name: user.user_metadata.name ?? user.email ?? user.id,
          avatar: user.user_metadata.avatar,
          color,
        });
      });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [roomName, user, color, handleMouseMove]);

  return (
    <RealtimeContext.Provider
      value={{ users, cursors, color, selectedNodes, channelRef }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};
