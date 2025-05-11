import { getCredits } from '@/app/actions/credits/get';
import { currentUser, currentUserProfile } from '@/lib/auth';
import { ClaimButton } from './claim-button';
import { CreditsCounter } from './credits-counter';
import { Menu } from './menu';
import { RealtimeAvatarStack } from './supabase-ui/realtime-avatar-stack';

type TopRightProps = {
  id: string;
};

export const TopRight = async ({ id }: TopRightProps) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const profile = await currentUserProfile();
  const credits = await getCredits();

  if ('error' in credits) {
    return null;
  }

  return (
    <>
      <div className="fixed top-16 right-0 left-0 z-[50] m-4 flex items-center gap-2 sm:top-0 sm:left-auto">
        <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1.5 drop-shadow-xs backdrop-blur-sm">
          <RealtimeAvatarStack roomName={`${id}-presence`} />
        </div>
        {profile.subscriptionId ? (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-3 drop-shadow-xs backdrop-blur-sm">
            <CreditsCounter credits={credits.credits} />
          </div>
        ) : (
          <div className="flex flex-1 items-center rounded-full border bg-card/90 p-0.5 drop-shadow-xs backdrop-blur-sm">
            <ClaimButton />
          </div>
        )}
        <div className="flex flex-1 items-center rounded-full border bg-card/90 p-1 drop-shadow-xs backdrop-blur-sm">
          <Menu />
        </div>
      </div>
    </>
  );
};
