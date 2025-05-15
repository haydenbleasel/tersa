'use client';

import { Logo } from '@/components/logo';
import { ThemeSwitcher } from '@/components/ui/kibo-ui/theme-switcher';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export const SubFooter = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-start justify-between gap-4 px-8 text-muted-foreground text-sm md:flex-row">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <Link href="/">
          <Logo className="h-4 w-auto" />
        </Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/acceptable-use">Acceptable Use</Link>
        <a
          href="https://github.com/haydenbleasel/tersa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code
        </a>
        <a
          href="https://x.com/haydenbleasel"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact
        </a>
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
