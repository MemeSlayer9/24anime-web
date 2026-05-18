/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, // silence the Turbopack warning
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://nightfall-delta.vercel.app/:path*',
      },
      {
        source: '/maaa/:path*',
        destination: 'https://maaa-six.vercel.app/:path*',
      },
      {
        source: '/anikoto/:path*',
        destination: 'https://anikotoapi.site/:path*',
      },
    ];
  },
};

export default nextConfig;