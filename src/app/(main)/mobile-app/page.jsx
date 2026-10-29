import { pageMetadata } from '@/seo';
import MobileAppClient from "./MobileAppClient";

export const metadata = pageMetadata('/mobile-app');

export default function MobileAppPage() {
  return <MobileAppClient />;
}
