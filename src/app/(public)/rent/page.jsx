import RentClient from './RentClient';
import { getPublicListings } from '@/seo/property.server';
import { listingMetadata, toSearchParams } from '@/seo/property-seo';
const query = 'purpose=rent&page=1&limit=12';
export async function generateMetadata({ searchParams }) {
  return listingMetadata('/rent', toSearchParams(await searchParams), await getPublicListings('/properties', query));
}
export default async function RentPage() {
  const result = await getPublicListings('/properties',query);
  return <RentClient initialData={result.data} initialError={result.state === 'error'} />;
}
