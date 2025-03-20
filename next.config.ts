import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tengolugar.s3.sa-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
