/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig