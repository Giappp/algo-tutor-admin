import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function getApiServerUrl() {
    const value = process.env.API_SERVER_URL?.trim();

    if (!value) {
        throw new Error(
            "Missing API_SERVER_URL. Copy .env.example to .env.local for local development or configure it in the deployment environment.",
        );
    }

    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("API_SERVER_URL must use http or https.");
    }

    if (url.pathname !== "/" || url.search || url.hash) {
        throw new Error("API_SERVER_URL must be an origin without a path, query, or hash.");
    }

    return url.origin;
}

const nextConfig: NextConfig = {
    async rewrites() {
        const apiServerUrl = getApiServerUrl();

        return [
            {
                source: "/api/v1/:path*",
                destination: `${apiServerUrl}/api/v1/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            new URL("https://placehold.co/**"),
            {
                protocol: "https",
                hostname: "algotutor-s3-bucket-390844772264-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
