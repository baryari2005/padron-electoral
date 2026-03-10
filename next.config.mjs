/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "1ypfpxokgs.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zrfngizmhyhosuluewnc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
