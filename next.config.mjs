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
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.xx.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "scontent*.xx.fbcdn.net",
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
        hostname: "**.facebook.com",
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
      {
        source: "/documents",
        destination: "/invitational",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
