import { Home } from '@/app/components/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tersa',
  description: 'Join the waitlist to get early access to Tersa.',
};

const HomePage = () => <Home />;

export default HomePage;
