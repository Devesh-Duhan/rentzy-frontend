import { cache } from 'react';
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
  return {
    title: property ? `${property.title} | RentzyPro` : 'Property details | RentzyPro',
    description: property?.description?.slice(0, 160) || 'Explore property details and connect with the owner on RentzyPro.',
    openGraph: { images: property?.images?.[0] ? [{ url: property.images[0] }] : [] },
  };
}
export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const initialData = await getPropertyData(id);
  if (initialData === false) notFound();
  return <PropertyDetailClient id={id} initialData={initialData} />;
}
