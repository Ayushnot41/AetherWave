import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the workspace root warning caused by multiple package-lock.json files
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
