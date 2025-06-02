/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 