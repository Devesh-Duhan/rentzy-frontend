import PageGuide from '@/components/content/PageGuide';
import SearchClient from './SearchClient';
import { getPublicListings } from '@/seo/property.server';
import { locationMetadata, searchQuery, toSearchParams } from '@/seo/property-seo';

export async function generateMetadata({ searchParams }) {
  const params = toSearchParams(await searchParams);
  return locationMetadata(params, await getPublicListings('/search', searchQuery(params)));
}
export default async function SearchPage({ searchParams }) {
  const params = toSearchParams(await searchParams);
  const query = searchQuery(params);
  const result = await getPublicListings('/search', query);
  const seo = locationMetadata(params, result);
  const city = result.data?.data?.[0]?.location?.city || result.data?.properties?.[0]?.location?.city;
  return <SearchClient initialData={result.data} initialError={result.state === 'error'} initialQuery={query} contentGuide={seo.robots.index ? <PageGuide page="location" subject={city} /> : null} />;
}
