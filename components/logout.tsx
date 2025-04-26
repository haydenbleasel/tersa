import { Panel } from '@xyflow/react';
import { LogoutButton } from './supabase-ui/logout-button';

export const Logout = () => (
  <Panel
    position="top-right"
    className="left-0! flex items-center justify-between gap-1 sm:left-auto!"
  >
    <LogoutButton />
  </Panel>
);
