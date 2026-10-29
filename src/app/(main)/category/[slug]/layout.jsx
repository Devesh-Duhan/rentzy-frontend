import { dynamicMetadata } from '@/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return dynamicMetadata('category', `/category/${encodeURIComponent(slug)}`);
}
export default function MetadataLayout({ children }) { return children; }
