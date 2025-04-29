import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import type { Provider } from '@supabase/supabase-js';

export const socialProviders: {
  name: string;
  icon: typeof SiGithub;
  id: Provider;
}[] = [
  {
    name: 'Github',
    icon: SiGithub,
    id: 'github',
  },
  {
    name: 'Twitter',
    icon: SiX,
    id: 'twitter',
  },
];
