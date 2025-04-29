import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hsbwwsadm9nwvz1a.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lhp3nvhhmxw8ikcx.public.blob.vercel-storage.com',
      },

      // Supabase storage
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;
