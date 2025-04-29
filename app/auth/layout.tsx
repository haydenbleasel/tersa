import { Logo } from '@/components/logo';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative flex h-screen min-h-[50rem] w-full items-center justify-center bg-secondary/50 p-8">
    <div className="grid w-full max-w-sm gap-8">
      <Logo className="mx-auto h-6 w-auto" />
      {children}
    </div>
  </div>
);

export default AuthLayout;
