import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["10.0.0.216"],
  devIndicators: false,

  images: {

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