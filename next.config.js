/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  output: 'export',
  trailingSlash: true,
  experimental: {
    serverActions: true
  },
  distDir: '.next'
}

module.exports = nextConfig 