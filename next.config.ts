import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
  },
  // Enable static export for Vercel
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/agent',
        destination: 'https://business-agent-430410298641.us-central1.run.app/',
      },
    ];
  },
};

export default nextConfig;
