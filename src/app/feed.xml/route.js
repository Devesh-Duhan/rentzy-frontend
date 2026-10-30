import { blogFeed } from '@/seo/feed';
import { PROPERTY_SEO } from '@/seo/seo.constants';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/blogs?limit=50&summary=true`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(PROPERTY_SEO.fetchTimeout) });
    if (!response.ok) throw new Error('Feed unavailable');
    const json = await response.json();
    const records = Array.isArray(json) ? json : json?.data;
    if (!Array.isArray(records)) throw new Error('Invalid feed');
    return new Response(blogFeed(records), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300' } });
  } catch {
    return new Response('Feed temporarily unavailable', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '300', 'X-Robots-Tag': 'noindex' } });
  }
}
