/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["ui-avatars.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                pathname: "**"
            },
            {
                protocol: "https",
                hostname: "1ypfpxokgs.ufs.sh",
                pathname: "**"
            }
        ]
    }
};

export default nextConfig;
