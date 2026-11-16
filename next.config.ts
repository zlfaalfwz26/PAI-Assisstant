import type { NextConfig } from "next";

/** Header keamanan dasar untuk seluruh halaman. */
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** Dashboard admin tidak boleh dimuat di dalam iframe (mencegah clickjacking). */
const adminSecurityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: baseSecurityHeaders },
      { source: "/admin", headers: adminSecurityHeaders },
      { source: "/admin/:path*", headers: adminSecurityHeaders },
      { source: "/api/admin/:path*", headers: adminSecurityHeaders },
    ];
  },
};

export default nextConfig;
