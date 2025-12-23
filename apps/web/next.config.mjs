import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 优化生产构建
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default withBundleAnalyzer(nextConfig);
