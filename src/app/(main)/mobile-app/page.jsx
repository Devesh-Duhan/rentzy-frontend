import PageGuide from '@/components/content/PageGuide';
import { pageMetadata } from '@/seo';
import MobileAppClient from "./MobileAppClient";

export const metadata = pageMetadata('/mobile-app');

export default function MobileAppPage() {
  return <MobileAppClient  contentGuide={<PageGuide page="mobile" />} />;
}
