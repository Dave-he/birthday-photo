import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app owns its own lockfile and dependencies — pin the Turbopack root
  // to apps/web so Next.js does not infer the monorepo root and watch the
  // whole repository during development.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
