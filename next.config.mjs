import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Disables PWA in dev mode
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This silences the Turbopack warning you saw in the Vercel logs
  experimental: {
    turbopack: {},
  },
};

export default withPWA(nextConfig);