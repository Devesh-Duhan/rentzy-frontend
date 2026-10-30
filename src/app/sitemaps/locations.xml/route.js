import { locationEntries } from '@/seo/sitemap.utils';
import { readSitemap, sitemapResponse, sitemapError } from '@/seo/sitemap.server';
export async function GET() {
  try { return sitemapResponse(locationEntries((await readSitemap('')).locations)); }
  catch { return sitemapError(); }
}
