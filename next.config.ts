import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /**
     * Serve TMDB URLs as-is (no `/_next/image`) → avoids Vercel Image Optimization cache writes
     * and origin processing on the free tier.
     */
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
