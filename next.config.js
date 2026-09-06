/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        //destination: "http://169.254.83.107:3001/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;