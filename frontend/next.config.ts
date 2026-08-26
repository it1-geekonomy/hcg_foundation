import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.22.112.1:3000", "10.0.0.226"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.hcgfoundation.org",
        pathname: "/assets/uploads/**",
      },
      {
        protocol: "https",
        hostname: "hcgfoundation.org",
        pathname: "/assets/uploads/**",
      },
    ],
  },
};

export default nextConfig;
