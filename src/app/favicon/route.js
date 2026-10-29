import { NextResponse } from 'next/server';
import { BRAND_ASSETS } from '@/lib/brand';

// Preserve old links; /favicon.ico itself is served directly from public/.
export function GET(request) {
  const response = NextResponse.redirect(new URL(BRAND_ASSETS.favicon, request.url), 307);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}
