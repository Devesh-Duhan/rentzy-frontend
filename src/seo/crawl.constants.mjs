// Public production URLs are independent of preview/deployment environment variables.
export const CRAWL = {
  cacheSeconds: 300, pageSize: 5000, maxPages: 10000, maxUrls: 50000,
  privatePaths: ['/admin', '/seller', '/owners', '/add', '/profile', '/wishlist', '/alerts', '/chat', '/notifications', '/become-seller', '/forgot-password', '/reset-password', '/verify-otp', '/offline'],
};
