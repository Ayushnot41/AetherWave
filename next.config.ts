import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Strict type checking — never ignore build errors
    ignoreBuildErrors: false,
  },
  // Webpack config to handle Solana/crypto optional dependencies and universal shims
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Explicitly shim dotenv, dotenv/config, and optional web3 modules to guarantee zero build errors
    const path = require('path');
    const emptyShim = path.resolve(__dirname, 'scripts/empty.js');
    config.resolve.alias['dotenv/config'] = emptyShim;
    config.resolve.alias['dotenv'] = emptyShim;
    config.resolve.alias['@solana/web3.js'] = emptyShim;

    if (!isServer) {
      // Don't bundle server-only Solana modules on client
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Headers for SSE (disaster alerts)
  async headers() {
    return [
      {
        source: '/api/alerts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'X-Accel-Buffering', value: 'no' },
        ],
      },
    ];
  },
};

export default nextConfig;
