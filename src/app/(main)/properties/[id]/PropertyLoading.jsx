import Link from 'next/link';
import ContentSkeleton from '@/components/ContentSkeleton';

export default function PropertyLoading() {
  return <main className="app-container space-y-6 pb-20 pt-28" aria-busy="true">
    <Link href="/properties" className="inline-flex text-sm font-semibold text-indigo-600">Back to properties</Link>
    <h1 className="text-2xl font-semibold">Property details</h1>
    <ContentSkeleton label="Loading property details" count={1} itemClassName="h-[45vh]" />
    <ContentSkeleton label="Loading property information" count={3} itemClassName="h-20" />
  </main>;
}
