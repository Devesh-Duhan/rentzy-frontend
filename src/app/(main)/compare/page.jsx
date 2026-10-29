import { pageMetadata } from '@/seo';
import CompareClient from "./CompareClient";

export const metadata = pageMetadata('/compare');

export default function ComparePage() {
  return <CompareClient />;
}
