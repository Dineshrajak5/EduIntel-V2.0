import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  async headers() {
    return [
      {
        source: '/api/crawl',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;
