import { dynamicEntries } from '@/seo/sitemap.utils';
import { readSitemap, sitemapResponse, sitemapError } from '@/seo/sitemap.server';
import { CRAWL } from '@/seo/crawl.constants.mjs';
export async function GET(request,{params}) {
  const {kind,page:input}=await params;
  if (!['properties','blogs'].includes(kind) || !/^[1-9]\d*\.xml$/.test(input)) return sitemapError(404);
  const page=Number(input.slice(0,-4));
  if (!Number.isSafeInteger(page) || page > CRAWL.maxPages) return sitemapError(404);
  try {
    const data=await readSitemap('/'+kind+'/'+page);
    if (data.page !== page) throw new Error('Invalid page');
    const entries=dynamicEntries(kind,data);
    return entries.length?sitemapResponse(entries):sitemapError(404);
  } catch { return sitemapError(); }
}
