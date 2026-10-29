import { Suspense } from 'react';
import PageClient from './SeoPageClient';
import { filterMetadata, toSearchParams } from '@/seo/property-seo';

export async function generateMetadata({ searchParams }) { return filterMetadata('/properties', toSearchParams(await searchParams)); }

export default function Page() {
  return <Suspense fallback={null}><PageClient /></Suspense>;
}
