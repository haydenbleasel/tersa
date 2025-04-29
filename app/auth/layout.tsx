import type { ReactNode } from 'react';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative flex h-screen w-full items-center justify-center bg-secondary">
    <div className="relative z-10 size-full p-8">{children}</div>
  </div>
);

export default AuthLayout;
