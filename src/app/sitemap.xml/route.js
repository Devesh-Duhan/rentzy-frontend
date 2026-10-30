import { readSitemap, sitemapResponse, sitemapError } from '@/seo/sitemap.server';
import { indexEntries } from '@/seo/sitemap.utils';
export async function GET() {
  try { return sitemapResponse(indexEntries(await readSitemap('')),true); }
  catch { return sitemapError(); }
}
