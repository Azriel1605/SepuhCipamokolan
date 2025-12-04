import type { NextConfig } from "next";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

let allowedDevOrigins: string[] = [];

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    // new URL(...) akan melempar jika value tidak valid
    const origin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    allowedDevOrigins = [origin];
  } catch (e) {
    // jika gagal parse, biarkan kosong (tidak memblokir build)
    console.warn("Could not parse NEXT_PUBLIC_API_URL for allowedDevOrigins:", process.env.NEXT_PUBLIC_API_URL);
    allowedDevOrigins = [];
  }
}

const nextConfig: NextConfig = {
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    allowedDevOrigins
  },
};
console.log("Building with API URL:", process.env.NEXT_PUBLIC_API_URL);
export default nextConfig;
