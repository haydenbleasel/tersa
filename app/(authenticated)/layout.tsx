import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
);

export default AuthenticatedLayout;
