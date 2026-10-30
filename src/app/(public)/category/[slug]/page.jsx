import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import CategoryClient from './CategoryClient';
import { getPublicCategory } from '@/seo/category.server';
import { categoryMetadata } from '@/seo/category-seo';
import { getPublicListings } from '@/seo/property.server';
import PublicQueryBoundary from '@/seo/PublicQueryBoundary';
import { CATEGORY_SEO } from '@/seo/seo.constants';

export async function generateMetadata({ params, searchParams }) {
  const result = await getPublicCategory((await params).slug);
  const filtered = Object.keys(await searchParams || {}).length > 0;
  return categoryMetadata(result.category, filtered, result.state === 'error');
}
export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const result = await getPublicCategory(slug);
  if (result.state === 'missing') notFound();
  if (result.state === 'error') return <main className="app-container min-h-[60vh] py-32"><h1 className="text-2xl font-semibold">{CATEGORY_SEO.failure.title}</h1><p className="my-4">{CATEGORY_SEO.failure.description}</p><a href={`/category/${encodeURIComponent(slug)}`} className="btn-secondary mr-4">Try again</a><Link href="/properties">Browse all properties</Link></main>;
  if (result.category.slug !== slug) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams || {})) for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
    permanentRedirect(`/category/${encodeURIComponent(result.category.slug)}${query.size ? '?' + query : ''}`);
  }
  const snapshot = await getPublicListings('/properties', new URLSearchParams({ type: result.category.slug }).toString());
  const entries = [{ key: ['public-category', slug], data: result.category }];
  if (snapshot.data) entries.push({ key: ['category-properties', slug, result.category.slug, null], data: snapshot.data.properties });
  return <PublicQueryBoundary entries={entries}><CategoryClient params={{ slug }} /></PublicQueryBoundary>;
}
