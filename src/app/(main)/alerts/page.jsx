import { pageMetadata } from '@/seo';
import AlertsClient from "./AlertsClient";

export const metadata = pageMetadata('/alerts');

export default function AlertsPage() {
  return <AlertsClient />;
}
