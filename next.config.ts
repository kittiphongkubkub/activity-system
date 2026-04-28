import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PERF: Tree-shake heavy packages — prevents the entire lucide-react and recharts
  // bundle from being evaluated on cold start when only a subset of exports is used.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  // Security: Don't advertise the framework
  poweredByHeader: false,
};

export default nextConfig;
