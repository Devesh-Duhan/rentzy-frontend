import { dynamicMetadata } from '@/seo';

export async function generateMetadata({ params }) {
  const { page } = await params;
  return dynamicMetadata('featured', `/featured-properties/${encodeURIComponent(page)}`);
}
export default function MetadataLayout({ children }) { return children; }
