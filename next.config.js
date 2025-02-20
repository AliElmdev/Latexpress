/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['avatars.githubusercontent.com'],
    },
    webpack: (config) => {
        config.cache = false; // Désactiver la mise en cache Webpack
        return config;
    },
}

module.exports = nextConfig;