const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://rentzypro.com').replace(/\/$/, '');
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

const staticPages = [
  { url: baseUrl, changeFrequency: 'daily', priority: 1.0 },
  { url: `${baseUrl}/properties`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${baseUrl}/buy`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${baseUrl}/rent`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${baseUrl}/featured-properties`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${baseUrl}/projects`, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${baseUrl}/gallery`, changeFrequency: 'weekly', priority: 0.6 },
  { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/help`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/rera`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/compare`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/tenant-screening`, changeFrequency: 'monthly', priority: 0.5 },
  { url: `${baseUrl}/safety`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/mobile-app`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/testimonials`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/refer`, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  { url: `${baseUrl}/refund-policy`, changeFrequency: 'yearly', priority: 0.2 },
];

// Authenticated / private areas must never be indexed.
const excludedPrefixes = [
  '/dashboard',
  '/admin',
  '/seller',
  '/owners',
  '/profile',
  '/chat',
  '/wishlist',
  '/search',
  '/alerts',
  '/notifications',
  '/add',
  '/become-seller',
  '/sell',
  '/login',
  '/register',
  '/logout',
];

export default async function sitemap() {
  const now = new Date();

  const entries = staticPages.map((page) => ({
    ...page,
    lastModified: now,
  }));

  const collect = async (endpoint, mapEntry) => {
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return;

      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data || json?.properties || json?.blogs || [];

      for (const item of items) {
        const mapped = mapEntry(item);
        if (mapped) entries.push({ ...mapped, lastModified: mapped.lastModified || now });
      }
    } catch {
      // Sitemap must still build when the API is unavailable.
    }
  };

  await collect('/properties?limit=500&status=available', (property) => {
    const slug = property.slug || property._id || property.id;
    if (!slug) return null;
    return {
      url: `${baseUrl}/properties/${slug}`,
      changeFrequency: 'daily',
      priority: 0.7,
    };
  });

  await collect('/blogs', (blog) => {
    const slug = blog.slug || blog._id || blog.id;
    if (!slug || blog.status !== 'published') return null;
    return {
      url: `${baseUrl}/blog/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      lastModified: blog.publishedAt || blog.updatedAt || undefined,
    };
  });

  return entries.filter(
    (entry) => !excludedPrefixes.some((prefix) => new URL(entry.url).pathname === prefix)
  );
}
