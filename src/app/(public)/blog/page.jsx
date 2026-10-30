import PageClient from './SeoPageClient';
import { pageMetadata } from '@/seo';
import { getPublicBlogs } from '@/seo/blog.server';
import PublicQueryBoundary from '@/seo/PublicQueryBoundary';
export const metadata=pageMetadata('/blog');
export default async function Page() {
  const result=await getPublicBlogs();
  return <PublicQueryBoundary entries={result.data?[{key:['public-blogs','list'],data:result.data}]:[]}><PageClient initialError={result.state==='error'} /></PublicQueryBoundary>;
}
