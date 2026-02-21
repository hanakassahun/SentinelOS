/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // ensure Next infers the client folder as root when multiple lockfiles exist
    root: './',
  },
  // Remove invalid experimental keys; Next.js 16.1.6 does not support allowedDevOrigins
  // If you need CORS or dev origin support, use a custom server or proxy.
}

module.exports = nextConfig;
