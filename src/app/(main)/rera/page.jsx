import { pageMetadata } from '@/seo';
import ReraClient from "./ReraClient";

export const metadata = pageMetadata('/rera');

export default function ReraPage() {
  return <ReraClient />;
}
