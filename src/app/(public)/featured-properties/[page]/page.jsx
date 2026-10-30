import { notFound } from 'next/navigation';
import FeaturedClient from './FeaturedClient';
import { dynamicMetadata } from '@/seo';
export const metadata = dynamicMetadata('featured', '/featured-properties');
export default async function Page({ params }) {
 const { page } = await params;
 if (!/^[1-9]\d{0,3}$/.test(page)) notFound();
 return <FeaturedClient />;
}
