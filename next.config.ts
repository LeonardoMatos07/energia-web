import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Keep visited member pages in the client router cache for 30 s so switching
    // back and forth between Painel, Estados and Usinas does not hit the server each time.
    staleTimes: { dynamic: 30, static: 180 },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Outlines carry their year in the file name: a new year is a new file.
      {
        source: "/geo/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
