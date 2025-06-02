/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Für Netlify Deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Output für statisches Export (falls gewünscht)
  // output: 'export'
}

module.exports = nextConfig 