import { Suspense } from 'react';
import ContentSkeleton from '@/components/ContentSkeleton';
import RentClient from './RentClient';
import { getPublicListings } from '@/seo/property.server';
import { listingMetadata, toSearchParams } from '@/seo/property-seo';

const query = 'purpose=rent&page=1&limit=12';
export async function generateMetadata({ searchParams }) {
  return listingMetadata('/rent', toSearchParams(await searchParams), await getPublicListings('/properties', query));
}
async function RentalContent() { const result = await getPublicListings('/properties', query); return <RentClient initialData={result.data} />; }
export default function RentPage() { return <Suspense fallback={<ContentSkeleton label="Loading properties" count={12} />}><RentalContent /></Suspense>; }
