import { CRAWL } from './src/seo/crawl.constants.mjs';
/** @type {import('next').NextConfig} */
// Fallback values for build environments (e.g., Vercel / CI) if not explicitly set
if (!process.env.NEXT_PUBLIC_URL) {
  process.env.NEXT_PUBLIC_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://rentzypro.com';
}

if (!process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = 'https://sea-turtle-app-g4msm.ondigitalocean.app/api';
}

if (process.env.NODE_ENV === 'production') {
  for (const key of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_URL']) {
    try {
      const val = process.env[key];
      if (val) {
        const url = new URL(val);
        if (!['http:', 'https:'].includes(url.protocol)) {
          console.warn(`[next.config] Warning: ${key} should be an HTTP(S) URL`);
        }
      }
    } catch {
      console.warn(`[next.config] Warning: ${key} is not a valid URL: ${process.env[key]}`);
    }
  }
}
const nextConfig = {
  trailingSlash: false,
  async rewrites() {
    // Root URLs give every sitemap site-wide scope without relying on Search Console submission.
    return [
      { source: '/sitemap-static.xml', destination: '/sitemaps/static.xml' },
      { source: '/sitemap-locations.xml', destination: '/sitemaps/locations.xml' },
      { source: '/sitemap-:kind(properties|blogs)-:page(\\d+).xml', destination: '/sitemaps/:kind/:page.xml' },
    ];
  },
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      ...CRAWL.privatePaths.map(source => ({ source: source+'/:path*', headers: noindex })),
      ...(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' ? [{ source: '/:path*', headers: noindex }] : []),
    ];
  },
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.rentzypro.com' }], destination: 'https://rentzypro.com/:path*', permanent: true },
      { source: '/:path*', has: [{ type: 'host', value: 'rentzypro.com' }, { type: 'header', key: 'x-forwarded-proto', value: 'http' }], destination: 'https://rentzypro.com/:path*', permanent: true },
      { source: '/site.webmanifest', destination: '/manifest.webmanifest', permanent: true },
    ];
  },
  ...(process.env.PLAYWRIGHT_TEST === '1' ? { distDir: '.next-playwright', typescript: { tsconfigPath: 'tests/tsconfig.next.json' } } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://sea-turtle-app-g4msm.ondigitalocean.app/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sea-turtle-app-g4msm.ondigitalocean.app',
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'https://rentzypro.com',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: '*.gravatar.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn.rentzypro.com' },
      { protocol: 'https', hostname: 'images.ctfassets.net' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
