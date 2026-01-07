import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/',
                destination: 'https://sunja.vercel.app',
                permanent: true,
            },
        ];
    },
};

const withPWA = nextPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [/middleware-manifest\.json$/],
});

export default withPWA(nextConfig);
