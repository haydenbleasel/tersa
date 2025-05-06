import { Logo } from '@/components/logo';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative flex h-screen min-h-[50rem] w-full items-center justify-center bg-secondary/50 p-8 dark:bg-background">
    <div className="grid w-full max-w-sm gap-8">
      <Link href="/" className="mx-auto h-10 w-auto">
        <Logo className="h-full text-border" />
      </Link>
      {children}
    </div>
  </div>
);

export default AuthLayout;
