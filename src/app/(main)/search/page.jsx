import { Suspense } from 'react';
import SearchClient from './SearchClient';
import ContentSkeleton from '@/components/ContentSkeleton';
import { getPublicListings } from '@/seo/property.server';
import { locationMetadata, searchQuery, toSearchParams } from '@/seo/property-seo';

export async function generateMetadata({ searchParams }) {
  const params = toSearchParams(await searchParams);
  return locationMetadata(params, await getPublicListings('/search', searchQuery(params)));
}
async function SearchContent({ searchParams }) {
  const query = searchQuery(toSearchParams(await searchParams));
  const result = await getPublicListings('/search', query);
  return <SearchClient initialData={result.data} initialQuery={query} />;
}
export default function SearchPage({ searchParams }) {
  return <Suspense fallback={<ContentSkeleton label="Loading properties" count={12} />}><SearchContent searchParams={searchParams} /></Suspense>;
}
