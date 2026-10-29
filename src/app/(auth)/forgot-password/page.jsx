import { Suspense } from 'react';
import PageClient from './SeoPageClient';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata('/forgot-password');

export default function Page() {
  return <Suspense fallback={null}><PageClient /></Suspense>;
}
