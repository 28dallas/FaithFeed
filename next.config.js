/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
}

module.exports = nextConfig