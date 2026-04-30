/** @type {import('next').NextConfig} */
const BUILD_ID = process.env.COMMIT_REF || process.env.CF_PAGES_COMMIT_SHA || `build-${Date.now()}`;
const BUILT_AT = new Date().toISOString();

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  generateBuildId: async () => {
    return BUILD_ID;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
    NEXT_PUBLIC_BUILT_AT: BUILT_AT,
    NEXT_PUBLIC_ENV_NAME: process.env.CONTEXT || process.env.NODE_ENV || 'unknown',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
