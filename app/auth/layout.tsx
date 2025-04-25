import Image from 'next/image';
import type { ReactNode } from 'react';
import Background from './background.jpg';

type AuthLayoutProps = {
  readonly children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative flex h-screen w-full items-center justify-center p-8">
    <Image
      src={Background}
      alt="Background"
      className="absolute inset-0 size-full object-cover"
      placeholder="blur"
    />
    <div className="relative z-10 size-full">{children}</div>
  </div>
);

export default AuthLayout;
