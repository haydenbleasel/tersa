import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { SubFooter } from './components/sub-footer';

type UnauthenticatedLayoutProps = {
  children: ReactNode;
};

const UnauthenticatedLayout = ({ children }: UnauthenticatedLayoutProps) => (
  <div className="container mx-auto py-8">
    <Header />
    {children}
    <Footer />
    <SubFooter />
  </div>
);

export default UnauthenticatedLayout;
