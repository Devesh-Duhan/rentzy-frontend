// Existing approved assets only. Sizes are verified against the actual file bytes.
export const BRAND_ASSETS = {
  favicon: '/favicon.ico',
  appleTouchIcon: '/images/apple-touch-icon.png',
  socialImage: '/images/android-chrome-512x512.png',
  manifest: '/manifest.webmanifest',
  manifestIcons: [
    { src: '/images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
};

export const BRAND_ICONS = {
  icon: { url: BRAND_ASSETS.favicon, type: 'image/x-icon', sizes: '16x16 32x32 48x48' },
  apple: { url: BRAND_ASSETS.appleTouchIcon, type: 'image/png', sizes: '180x180' },
};

export const WEB_APP_BRAND = {
  start_url: '/', scope: '/', display: 'standalone',
  background_color: '#ffffff', theme_color: '#4f46e5',
};
