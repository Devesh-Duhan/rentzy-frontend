import PageGuide from '@/components/content/PageGuide';
import { notFound } from 'next/navigation';
import { propertyMetadata } from '@/seo/property-seo';
import { getPublicProperty } from '@/seo/property.server';
import PropertyDetailClient from './PropertyDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getPublicProperty(id);
  if (result.state === 'missing') notFound();
  return propertyMetadata(result.property, id, result.state);
}
export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const result = await getPublicProperty(id);
  if (result.state === 'missing') notFound();
  return <PropertyDetailClient id={id} initialData={result.property} initialError={result.state === 'error'} contentGuide={result.property ? <PageGuide page="property" subject={result.property.title} /> : null} />;
}
