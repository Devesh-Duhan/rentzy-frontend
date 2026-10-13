const BASE_URL = (process.env.NEXT_PUBLIC_URL || 'https://rentzypro.com').replace(/\/$/, '');
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Descriptions may contain raw HTML, which is invalid inside an RSS element.
const stripHtml = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  let blogs = [];

  try {
    const res = await fetch(`${API_URL}/blogs?limit=50`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const json = await res.json();
      blogs = Array.isArray(json) ? json : json?.data || [];
    }
  } catch {
    // Return a valid (empty) feed when the API is unavailable.
  }

  const blogItems = blogs
    .filter((blog) => blog?.status === 'published')
    .map((blog) => {
      const slug = blog.slug || blog._id;
      const link = `${BASE_URL}/blog/${encodeURIComponent(slug)}`;
      const description = stripHtml(blog.excerpt || blog.content || '').slice(0, 300);

      return `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(blog.publishedAt || blog.createdAt || Date.now()).toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>rentzypro - Property Blog</title>
    <link>${escapeXml(BASE_URL)}</link>
    <description>Latest real estate news, tips, and property listings from rentzypro</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${BASE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${blogItems}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
