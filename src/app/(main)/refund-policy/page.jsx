import PageGuide from '@/components/content/PageGuide';
import PageClient from './SeoPageClient';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata('/refund-policy');

export default function Page() {
  return <PageClient  contentGuide={<PageGuide page="refund" />} />;
}
