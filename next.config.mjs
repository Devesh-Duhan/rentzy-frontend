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
  process.env.NEXT_PUBLIC_API_URL = 'https://rentzy-backend-lh5y.onrender.com/api';
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
  ...(process.env.PLAYWRIGHT_TEST === '1' ? { distDir: '.next-playwright', typescript: { tsconfigPath: 'tests/tsconfig.next.json' } } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://rentzy-backend-lh5y.onrender.com/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rentzy-backend-lh5y.onrender.com',
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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
