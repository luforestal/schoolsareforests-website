/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'luforestal.github.io',
      },
    ],
  },
}

export default nextConfig
