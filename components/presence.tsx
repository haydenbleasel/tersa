'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarStack } from '@/components/ui/kibo-ui/avatar-stack';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRealtime } from '@/providers/realtime';
import { type CSSProperties, useMemo } from 'react';

const MAX_AVATARS_AMOUNT = 3;

export const Presence = () => {
  const { users } = useRealtime();

  const avatars = useMemo(
    () =>
      Object.values(users).map((user) => ({
        name: user.name,
        image: user.avatar,
        color: user.color,
      })),
    [users]
  );

  const shownAvatars = avatars.slice(0, MAX_AVATARS_AMOUNT);
  const hiddenAvatars = avatars.slice(MAX_AVATARS_AMOUNT);

  return (
    <AvatarStack size={32}>
      {shownAvatars.map(({ name, image, color }, index) => (
        <Tooltip key={`${name}-${image}-${index}`}>
          <TooltipTrigger asChild className="size-full">
            <Avatar
              className="border-2 border-[var(--border-color)] hover:z-10"
              style={{ '--border-color': color } as CSSProperties}
            >
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
