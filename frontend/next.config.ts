import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable React strict mode for development */
  reactStrictMode: true,

  /* Transpile Three.js ecosystem packages for ESM compatibility */
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],

  /* Experimental features for React 19 */
  experimental: {
    /* Enable server actions (default in Next.js 15, explicit for clarity) */
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
