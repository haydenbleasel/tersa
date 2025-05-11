'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarStack } from '@/components/ui/kibo-ui/avatar-stack';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRealtimePresenceRoom } from '@/hooks/use-realtime-presence-room';
import { useMemo } from 'react';

const MAX_AVATARS_AMOUNT = 3;

export const Presence = ({ roomName }: { roomName: string }) => {
  const { users: usersMap } = useRealtimePresenceRoom(roomName);

  const avatars = useMemo(
    () =>
      Object.values(usersMap).map((user) => ({
        name: user.name,
        image: user.avatar,
      })),
    [usersMap]
  );

  const shownAvatars = avatars.slice(0, MAX_AVATARS_AMOUNT);
  const hiddenAvatars = avatars.slice(MAX_AVATARS_AMOUNT);

  return (
    <AvatarStack size={32}>
      {shownAvatars.map(({ name, image }, index) => (
        <Tooltip key={`${name}-${image}-${index}`}>
          <TooltipTrigger asChild className="size-full">
            <Avatar className="hover:z-10">
              <AvatarImage src={image} />
              <AvatarFallback>
                {name
                  ?.split(' ')
                  ?.map((word) => word[0])
                  ?.join('')
                  ?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      ))}

      {hiddenAvatars.length ? (
        <Tooltip key="hidden-avatars">
          <TooltipTrigger asChild>
            <Avatar>
              <AvatarFallback>
                +{avatars.length - shownAvatars.length}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            {hiddenAvatars.map(({ name }, index) => (
              <p key={`${name}-${index}`}>{name}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </AvatarStack>
  );
};
