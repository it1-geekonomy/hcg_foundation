import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  allowedDevOrigins: ["10.0.0.216"],
  devIndicators: false,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "country-state-city",
      "world-countries",
      "libphonenumber-js",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [55, 60, 70, 75],
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

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
