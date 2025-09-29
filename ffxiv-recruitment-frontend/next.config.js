/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img2.finalfantasyxiv.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'xivapi.com',
          pathname: '/**',
        },
      ],
    },
    env: {
      API_BASE_URL: process.env.API_BASE_URL,
    },
  }
  
  module.exports = nextConfig