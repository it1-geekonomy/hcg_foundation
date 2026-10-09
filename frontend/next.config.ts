import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["10.0.0.216"],
  devIndicators: false,

  images: {
    // Optimized images keep a long cache. The default 60s is what PageSpeed flags.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hcgfoundation.org",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "hcgfoundation.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;