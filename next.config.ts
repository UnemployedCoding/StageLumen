import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Keep historical staging images from the legacy host displayable.
      {
        protocol: "https",
        hostname: "api.mnmlai.dev",
      },
      {
        protocol: "https",
        hostname: "api.mnml.ai",
      },
    ],
  },
};

export default nextConfig;
