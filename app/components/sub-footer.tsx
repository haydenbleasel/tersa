'use client';

import { Logo } from '@/components/logo';
import { ThemeSwitcher } from '@/components/ui/kibo-ui/theme-switcher';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export const SubFooter = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-4 text-muted-foreground text-sm">
      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <div className="flex items-center">
        <Logo className="mx-auto h-4 w-auto" />
      </div>
      <div className="flex items-center justify-end">
        <ThemeSwitcher
          value={theme as 'light' | 'dark' | 'system'}
          onChange={setTheme}
        />
      </div>
    </div>
  );
};
