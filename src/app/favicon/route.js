import { NextResponse } from 'next/server';
import { LOGO_SRC } from '@/lib/constants';

export function GET(request) {
  const response = NextResponse.redirect(new URL(LOGO_SRC, request.url), 307);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}
