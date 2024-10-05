/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e7dkjdqrw2vwupmj.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
