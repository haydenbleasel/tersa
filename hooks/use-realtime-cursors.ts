import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from './use-user';

/**
 * Throttle a callback to a certain delay, It will only call the callback if the delay has passed, with the arguments
 * from the last call
 */
const useThrottleCallback = <Params extends unknown[], Return>(
  callback: (...args: Params) => Return,
  delay: number
) => {
  const lastCall = useRef(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Params) => {
      const now = Date.now();
      const remainingTime = delay - (now - lastCall.current);

      if (remainingTime <= 0) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
        lastCall.current = now;
        callback(...args);
      } else if (!timeout.current) {
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          callback(...args);
        }, remainingTime);
      }
    },
    [callback, delay]
  );
};

const supabase = createClient();

const generateRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;

const EVENT_NAME = 'realtime-cursor-move';

type CursorEventPayload = {
  position: {
    x: number;
    y: number;
  };
  user: {
    id: string;
    name: string;
  };
  color: string;
  timestamp: number;
};

export const useRealtimeCursors = ({
  roomName,
  throttleMs,
}: {
  roomName: string;
  throttleMs: number;
}) => {
  const user = useUser();
  const [color] = useState(generateRandomColor());
  const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>(
    {}
  );

  const channelRef = useRef<RealtimeChannel | null>(null);

  const callback = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (!user) {
        return;
      }

      const payload: CursorEventPayload = {
        position: {
          x: clientX,
          y: clientY,
        },
        user: {
          id: user.id,
          name: user.user_metadata.name ?? user.email ?? user.id,
        },
        color: color,
        timestamp: new Date().getTime(),
      };

      channelRef.current?.send({
        type: 'broadcast',
        event: EVENT_NAME,
        payload: payload,
      });
    },
    [color, user]
  );

  const handleMouseMove = useThrottleCallback(callback, throttleMs);

  useEffect(() => {
    const channel = supabase.channel(roomName);
    channelRef.current = channel;

    channel
      .on(
        'broadcast',
        { event: EVENT_NAME },
        (data: { payload: CursorEventPayload }) => {
          const payload = data.payload;
          // Don't render your own cursor
          if (user?.id === payload.user.id) {
            return;
          }

          setCursors((prev) => {
            if (prev[payload.user.id]) {
              delete prev[payload.user.id];
            }

            return {
              ...prev,
              [payload.user.id]: payload,
            };
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomName, user]);

  useEffect(() => {
    // Add event listener for mousemove
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return { cursors };
};
