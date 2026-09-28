/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "scontent.xx.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.facebook.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/evovision",
        destination: "/evos1.0",
        permanent: false,
      },
      {
        source: "/evos1",
        destination: "/evos1.0",
        permanent: false,
      },
      {
        source: "/evos",
        destination: "/evos1.0",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
