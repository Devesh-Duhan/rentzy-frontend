import { staticEntries } from '@/seo/sitemap.utils';
import { sitemapResponse } from '@/seo/sitemap.server';
export function GET() { return sitemapResponse(staticEntries()); }
