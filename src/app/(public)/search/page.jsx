import SearchClient from './SearchClient';
import { getPublicListings } from '@/seo/property.server';
import { locationMetadata, searchQuery, toSearchParams } from '@/seo/property-seo';

export async function generateMetadata({ searchParams }) {
  const params = toSearchParams(await searchParams);
  return locationMetadata(params, await getPublicListings('/search', searchQuery(params)));
}
export default async function SearchPage({ searchParams }) {
  const query = searchQuery(toSearchParams(await searchParams));
  const result = await getPublicListings('/search', query);
  return <SearchClient initialData={result.data} initialError={result.state === 'error'} initialQuery={query} />;
}
