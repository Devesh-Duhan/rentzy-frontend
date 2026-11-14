import JsonLd from '@/seo/JsonLd';
import { websiteSchema } from '@/seo/schema';
import HomeClient from './HomeClient';
import { pageMetadata } from '@/seo';
import { HOME_CATEGORIES, homeQuery, homeQueryKey } from '@/lib/home-properties';
import { getPublicListings } from '@/seo/property.server';
import PublicQueryBoundary from '@/seo/PublicQueryBoundary';

export const metadata = pageMetadata('/');
export default async function Home() {
  // Featured listings are seeded for BOTH purpose tabs so the home rail's
  // Sell/Rent switch renders its own server-fetched data instantly instead of
  // falling back to a client fetch for the non-default tab.
  const tasks = HOME_CATEGORIES.flatMap(category => category.featured
    ? ['sell', 'rent'].map(purpose => ({ category, purpose }))
    : [{ category, purpose: undefined }]);
  const snapshots = await Promise.all(tasks.map(async task => ({ ...task, result: await getPublicListings('/properties', homeQuery(task.category, task.purpose)) })));
  const entries = snapshots.filter(item => item.result.data).map(item => ({ key: homeQueryKey(item.category, item.purpose), data: item.result.data }));
  const failures = [...new Set(snapshots.filter(item => item.result.state === 'error').map(item => item.category.value))];
  return <><JsonLd id="website-schema" data={websiteSchema()} /><PublicQueryBoundary entries={entries}><HomeClient failures={failures} /></PublicQueryBoundary></>;
}
