/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Disable experimental features that increase file watchers
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config, { isServer }) => {
    // Reduce file watchers to prevent EMFILE errors on macOS
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/dist/**',
        '**/.turbo/**',
        '**/coverage/**',
      ],
      aggregateTimeout: 500,
      poll: false,
    };
    
    // Reduce module resolution attempts
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
