/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "falsisters-bucket.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "edwjpaczxvmnrjjrtzjq.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "9mb",
    },
  },
};

module.exports = nextConfig;
