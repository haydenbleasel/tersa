'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useUser } from './use-user';

const supabase = createClient();

export type RealtimeUser = {
  id: string;
  name: string;
  avatar: string;
};

export const useRealtimePresenceRoom = (roomName: string) => {
  const user = useUser();
  const [users, setUsers] = useState<Record<string, RealtimeUser>>({});

  useEffect(() => {
    const room = supabase.channel(roomName);

    if (!user) {
      return;
    }

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState<{ avatar: string; name: string }>();

        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [
            key,
            { name: values[0].name, avatar: values[0].avatar },
          ])
        ) as Record<string, RealtimeUser>;
        setUsers(newUsers);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return;
        }

        await room.track({
          name: user.user_metadata.name ?? user.email ?? user.id,
          avatar: user.user_metadata.avatar,
        });
      });

    return () => {
      room.unsubscribe();
    };
  }, [roomName, user]);

  return { users };
};
