import JsonLd from '@/seo/JsonLd';
import { websiteSchema } from '@/seo/schema';
import HomeClient from './HomeClient';
import { pageMetadata } from '@/seo';
import { HOME_CATEGORIES, homeQuery, homeQueryKey } from '@/lib/home-properties';
import { getPublicListings } from '@/seo/property.server';
import PublicQueryBoundary from '@/seo/PublicQueryBoundary';

export const metadata = pageMetadata('/');
export default async function Home() {
  const snapshots = await Promise.all(HOME_CATEGORIES.map(async category => ({category, result:await getPublicListings('/properties',homeQuery(category))})));
  const entries = snapshots.filter(item=>item.result.data).map(item=>({key:homeQueryKey(item.category),data:item.result.data}));
  const failures = snapshots.filter(item=>item.result.state==='error').map(item=>item.category.value);
  return <><JsonLd id="website-schema" data={websiteSchema()} /><PublicQueryBoundary entries={entries}><HomeClient failures={failures} /></PublicQueryBoundary></>;
}
