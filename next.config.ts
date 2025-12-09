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

      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  eslint: {
    // Lint all custom directories in src/
    dirs: [
      'src/actions',
      'src/app',
      'src/components',
      'src/config',
      'src/emails',
      'src/hooks',
      'src/lib',
      'src/schemas',
      'src/services',
      'src/store',
      'src/types',
      'src/utils',
    ],
    // Disable Next.js built-in linting during builds (using ESLint CLI in scripts instead)
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
