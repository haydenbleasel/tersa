import { Cormorant_Upright, Geist, Geist_Mono } from 'next/font/google';

export const sans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const serif = Cormorant_Upright({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
});
