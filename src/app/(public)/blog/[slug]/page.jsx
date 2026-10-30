import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicBlog } from '@/seo/blog.server';
import { blogMetadata, blogPath } from '@/seo/blog-seo';
import BlogDetailClient from './BlogDetailClient';
export async function generateMetadata({ params }) {
  const {slug}=await params;const result=await getPublicBlog(slug);
  if(result.state==='missing')notFound();
  return blogMetadata(result.blog,slug,result.state);
}
export default async function ArticlePage({params}) {
  const {slug}=await params;const result=await getPublicBlog(slug);
  if(result.state==='missing')notFound();
  if(result.blog && blogPath(result.blog)!=='/blog/'+slug)permanentRedirect(blogPath(result.blog));
  return <BlogDetailClient initialData={result.blog} initialError={result.state==='error'} />;
}
