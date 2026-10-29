import { SITE_SEO, CRAWL_SEO, canonicalUrl } from '@/seo';

export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: CRAWL_SEO.disallow }, sitemap: canonicalUrl(CRAWL_SEO.sitemapPath), host: SITE_SEO.baseUrl };
}
