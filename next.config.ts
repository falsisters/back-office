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
    ],
  },
}

export default nextConfig

