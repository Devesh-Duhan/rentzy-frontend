import { NextResponse } from 'next/server';
import { BRAND_ASSETS } from '@/lib/brand';

// Permanent legacy alias; /favicon.ico itself is served directly from public/.
export function GET(request) {
  const response = NextResponse.redirect(new URL(BRAND_ASSETS.favicon, request.url), 308);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}
