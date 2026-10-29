import { pageMetadata } from '@/seo';
import SearchClient from "./SearchClient";

export const metadata = pageMetadata('/search');

export default function SearchPage() {
  return <SearchClient />;
}
