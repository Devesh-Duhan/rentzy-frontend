import PageGuide from '@/components/content/PageGuide';
import { pageMetadata } from '@/seo';
import ReraClient from "./ReraClient";

export const metadata = pageMetadata('/rera');

export default function ReraPage() {
  return <ReraClient  contentGuide={<PageGuide page="rera" />} />;
}
