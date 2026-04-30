import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /** Bypass Vercel Image Optimization (free-tier quota). Images load directly from remote URLs. */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;
