import { SITE_SEO, PAGE_SEO, canonicalUrl } from '@/seo';
const baseUrl = SITE_SEO.baseUrl;
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const staticPages = Object.values(PAGE_SEO)
  .filter(page => page.sitemap !== false && page.robots?.index !== false)
  .map(page => ({ url: canonicalUrl(page.canonical) }));

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

  return entries;
}
