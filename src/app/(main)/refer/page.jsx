import { pageMetadata } from '@/seo';
import ReferClient from "./ReferClient";

export const metadata = pageMetadata('/refer');

export default function ReferPage() {
  return <ReferClient />;
}
