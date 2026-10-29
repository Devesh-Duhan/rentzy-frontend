import { dynamicMetadata } from '@/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return dynamicMetadata('blog', `/blog/${encodeURIComponent(slug)}`);
}
export default function MetadataLayout({ children }) { return children; }
