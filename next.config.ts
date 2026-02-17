import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "xxxxxx.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "neuropost.2ffafdbc8507c0285b109f7f49e53cb1.r2.cloudflarestorage.com", pathname: "/**"}
    ],
  },
};

export default nextConfig;
