/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow the dev API server (localhost:5000) to be used as a remote image
    // source. This covers the upload URLs like http://localhost:5000/uploads/<file>.
    // Add your production host(s) here (e.g. 'api.mydimz.com') when deploying.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
