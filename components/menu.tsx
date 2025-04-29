import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { Panel } from '@xyflow/react';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type MouseEventHandler, useEffect, useState } from 'react';
import { Profile } from './profile';
import { Subscribe } from './subscribe';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

export const Menu = () => {
  const router = useRouter();
  const { projectId } = useParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const user = useUser();

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

  const handleOpenSubscribe: MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDropdownOpen(false);

    // shadcn/ui issue: dropdown animation causes profile modal to close immediately after opening
    setTimeout(() => {
      setSubscribeOpen(true);
    }, 200);
  };

  useEffect(() => {
    const loadBillingUrl = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setSubscribed(Boolean(data.user?.user_metadata.stripeSubscriptionId));
    };

    loadBillingUrl();
  }, []);

  return (
    <>
      <Panel
        position="top-right"
        className="top-16! left-0 flex items-center gap-2 sm:top-0! sm:left-auto"
      >
        {/* {typeof projectId === 'string' && (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1.5 drop-shadow-xs backdrop-blur-sm">
            <RealtimeAvatarStack roomName={projectId} />
          </div>
        )} */}
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
              <DropdownMenuLabel className="grid gap-2">
                <Avatar>
                  <AvatarImage src={user?.user_metadata.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground uppercase">
                    {(user?.user_metadata.name ?? user?.email ?? user?.id)
                      ?.split(' ')
                      .map((name: string) => name.at(0))
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <p>{user?.user_metadata.name ?? user?.email ?? user?.id}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenProfile}>
                Profile
              </DropdownMenuItem>
              {subscribed ? (
                <DropdownMenuItem asChild>
                  <Link href="/api/stripe/portal">Billing</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleOpenSubscribe} disabled>
                  Subscribe
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Panel>
      <Profile open={profileOpen} setOpen={setProfileOpen} />
      <Subscribe open={subscribeOpen} setOpen={setSubscribeOpen} />
    </>
  );
};
