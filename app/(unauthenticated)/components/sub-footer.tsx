'use client';

import { Logo } from '@/components/logo';
import { ThemeSwitcher } from '@/components/ui/kibo-ui/theme-switcher';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export const SubFooter = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-start justify-between gap-4 px-8 text-muted-foreground text-sm">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Logo className="h-4 w-auto" />
        </Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
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
