const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@weiwuweixin/ui', '@weiwuweixin/shared', '@weiwuweixin/scoring'],

  /* ── 图片优化 ── */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  /* ── 压缩 ── */
  compress: true,

  /* ── 安全 Headers ── */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Exclude native .node binaries from webpack bundling
    // @resvg/resvg-js will be loaded dynamically at runtime
    config.resolve.alias = {
      ...config.resolve.alias,
      '@resvg/resvg-js': false,
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);