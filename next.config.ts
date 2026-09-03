import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // Trên Vercel, hệ thống tự động tối ưu hóa serverless bundling nên không dùng standalone.
  // Khi đóng gói Docker / máy chủ VPS độc lập, kích hoạt output: "standalone".
  output: isVercel ? undefined : "standalone",
  reactStrictMode: true
};

export default nextConfig;
