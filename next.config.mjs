import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Настройка порта для продакшена
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
  publicRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
};

export default withNextIntl(nextConfig);
