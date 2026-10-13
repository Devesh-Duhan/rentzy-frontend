/** @type {import('next').NextConfig} */
if (process.env.NODE_ENV === 'production') {
  for (const key of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_URL']) {
    if (!process.env[key]) throw new Error(`${key} is required for a production build`);
    const url = new URL(process.env[key]);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${key} must be an HTTP(S) URL`);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw new Error(`${key} must use HTTPS outside local development`);
    }
  }
}
const nextConfig = {
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
