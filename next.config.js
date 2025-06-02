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
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  distDir: '.next'
}

module.exports = nextConfig 