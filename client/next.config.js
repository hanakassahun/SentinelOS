/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // ensure Next infers the client folder as root when multiple lockfiles exist
    root: './',
  },
  experimental: {
    // allow dev origins to prevent cross-origin dev warnings when using LAN host
    allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
}

module.exports = nextConfig;
