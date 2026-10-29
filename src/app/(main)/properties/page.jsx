import { Suspense } from 'react';
import PageClient from './SeoPageClient';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata('/properties');

export default function Page() {
  return <Suspense fallback={null}><PageClient /></Suspense>;
}
