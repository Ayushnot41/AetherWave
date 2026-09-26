import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Strict type checking — never ignore build errors
    ignoreBuildErrors: false,
  },
  // Allow @solana/web3.js and bs58 which use Node.js crypto APIs
  serverExternalPackages: ['@solana/web3.js', 'bs58'],
  // Webpack config to handle Solana/crypto optional dependencies
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Don't bundle server-only Solana modules on client
      config.resolve = config.resolve || {};
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
