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
import { useRouter } from 'next/navigation';
import { CurrentUserAvatar } from './supabase-ui/current-user-avatar';
import { Button } from './ui/button';

export const Menu = () => {
  const router = useRouter();
  const name = useCurrentUserName();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Panel
      position="top-right"
      className="left-0! flex items-center justify-between gap-1 rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm sm:left-auto!"
    >
      <DropdownMenu>
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
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Panel>
  );
};
