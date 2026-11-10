import { categoryEntries } from '@/seo/sitemap.utils';
import { readSitemap, sitemapResponse, sitemapError } from '@/seo/sitemap.server';

export async function GET() {
  try {
    const entries = categoryEntries((await readSitemap('')).categories);
    return entries.length ? sitemapResponse(entries) : sitemapError(404);
  } catch {
    return sitemapError();
  }
}
