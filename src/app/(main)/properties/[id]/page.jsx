import { cache, Suspense } from 'react';
import { dynamicMetadata, metadataText } from '@/seo';
import PropertyLoading from './PropertyLoading';
import { notFound } from 'next/navigation';
import PropertyDetailClient from './PropertyDetailClient';

const getPropertyData = cache(async id => {
  if (!/^[a-f\d]{24}$/i.test(id)) return false;
  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    const response = await fetch(`${apiUrl}/properties/${id}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (response.status === 404 || response.status === 400) return false;
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
});
export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyData(id);
  return dynamicMetadata('property', `/properties/${encodeURIComponent(id)}`, {
    ...(property?.title ? { title: property.title } : {}),
    ...(property?.description ? { description: metadataText(property.description).slice(0, 160) } : {}),
    ...(property?.images?.[0] ? { image: property.images[0] } : {}),
    ...(property === false ? { robots: { index: false, follow: false } } : {}),
  });
}
async function PropertyContent({ id }) {
  const initialData = await getPropertyData(id);
  if (initialData === false) notFound();
  return <PropertyDetailClient id={id} initialData={initialData} />;
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  return <Suspense fallback={<PropertyLoading />}><PropertyContent id={id} /></Suspense>;
}
