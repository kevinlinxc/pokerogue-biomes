/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.pokemondb.net',
            },
        ],
    },
    async headers() {
        return [
            {
                // Cache locally served sprites aggressively
                source: '/sprites/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        // If you update sprites without renaming, reduce max-age. Otherwise, keep immutable for best perf.
                        value: 'public, max-age=31536000, immutable', // 1 year
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
