import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Allow requests from local network IP during development
    // Adjust the pattern if your local network uses a different range
    allowedDevOrigins: ["http://192.168.1.*:3000"],
  },
};

export default nextConfig;
