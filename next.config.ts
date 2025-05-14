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

  async headers() {
    // return [
    //   {
    //     source: '/sw.js',
    //     headers: [
    //       {
    //         key: 'Cache-Control',
    //         value: 'public, max-age=0, must-revalidate',
    //       },
    //       {
    //         key: 'Service-Worker-Allowed',
    //         value: '/',
    //       },
    //     ],
    //   },
    // ];
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
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
