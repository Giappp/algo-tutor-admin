import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            new URL('https://placehold.co/**'), 
            {
            protocol: 'https',
            hostname: 'algotutor-s3-bucket-390844772264-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com',
            port: '',
            pathname: '/**',
        },]
    }
};

export default nextConfig;
