import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network devices (phone, tablet) to access the dev server
  allowedDevOrigins: ['192.168.31.91'],
};

export default nextConfig;
