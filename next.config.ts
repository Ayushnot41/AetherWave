import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Keep dotenv and @solana/web3.js out of the webpack bundle.
  // Next.js loads .env files natively — no need to bundle dotenv.
  // @solana/web3.js is shimmed below for client bundles.
  serverExternalPackages: ['dotenv', '@solana/web3.js', 'bs58'],
  // Webpack: shim optional server-only modules on the client side
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // On Vercel/Linux and Windows: use webpack's built-in `false` alias
    // to produce a zero-byte empty module without any filesystem path lookup.
    config.resolve.alias['dotenv/config'] = false;
    config.resolve.alias['dotenv'] = false;

    if (!isServer) {
      // Prevent @solana/web3.js from being bundled in the browser
      config.resolve.alias['@solana/web3.js'] = false;
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
