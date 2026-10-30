import { FEED_SEO, SITE_SEO } from './seo.constants.js';
import { publicBlog, blogPath } from './blog-seo.js';
import { metadataText, canonicalUrl } from './seo.utils.js';
import { xmlEscape } from './sitemap.utils.js';

export function blogFeed(records) {
  const items = records.map(record => publicBlog(record, true)).filter(Boolean).slice(0, 50).map(blog => {
    const link = canonicalUrl(blogPath(blog));
    const date = blog.publishDate ? new Date(blog.publishDate) : null;
    const pubDate = date && Number.isFinite(date.getTime()) && date.getTime() <= Date.now() ? `<pubDate>${date.toUTCString()}</pubDate>` : '';
    return `<item><title>${xmlEscape(metadataText(blog.title))}</title><link>${xmlEscape(link)}</link><description>${xmlEscape(metadataText(blog.excerpt || '').slice(0, 300))}</description>${pubDate}<guid isPermaLink="true">${xmlEscape(link)}</guid></item>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(FEED_SEO.title)}</title><link>${SITE_SEO.baseUrl}</link><description>${xmlEscape(FEED_SEO.description)}</description><language>${FEED_SEO.language}</language><atom:link href="${SITE_SEO.baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}
