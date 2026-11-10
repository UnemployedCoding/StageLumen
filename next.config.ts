import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Used by the portable Docker build; Vercel keeps its normal output.
  ...(process.env.STAGELUMEN_STANDALONE === "1" ? { output: "standalone" as const } : {}),
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
