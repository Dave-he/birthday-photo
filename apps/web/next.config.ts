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
  async headers() {
    return [
      {
        // Self-hosted scene assets. Next.js serves everything in public/ with
        // `max-age=0`, so the display font and the cloud texture were
        // re-downloaded on every single visit. A week of caching plus
        // stale-while-revalidate keeps repeat visits instant; bump the file
        // name when the asset itself changes.
        source: "/:path(fonts|textures)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
