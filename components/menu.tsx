import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUserName } from '@/hooks/use-current-user-name';
import { createClient } from '@/lib/supabase/client';
import { Panel } from '@xyflow/react';
import { MenuIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { type MouseEventHandler, useState } from 'react';
import { Profile } from './profile';
import { CurrentUserAvatar } from './supabase-ui/current-user-avatar';
import { RealtimeAvatarStack } from './supabase-ui/realtime-avatar-stack';
import { Button } from './ui/button';

export const Menu = () => {
  const router = useRouter();
  const name = useCurrentUserName();
  const { projectId } = useParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleOpenProfile: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDropdownOpen(false);

    // shadcn/ui issue: dropdown animation causes profile modal to close immediately after opening
    setTimeout(() => {
      setProfileOpen(true);
    }, 200);
  };

  return (
    <>
      <Panel
        position="top-right"
        className="top-16! left-0 flex items-center gap-2 sm:top-0! sm:left-auto"
      >
        {typeof projectId === 'string' && (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1.5 drop-shadow-xs backdrop-blur-sm">
            <RealtimeAvatarStack roomName={projectId} />
          </div>
        )}
        <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MenuIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              collisionPadding={8}
              sideOffset={16}
            >
              <DropdownMenuLabel>
                <CurrentUserAvatar />
                <p>{name}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenProfile}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Panel>
      <Profile open={profileOpen} setOpen={setProfileOpen} />
    </>
  );
};
