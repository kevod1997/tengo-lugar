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
    }
  }
};

export default nextConfig;
