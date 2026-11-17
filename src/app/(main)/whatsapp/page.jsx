import PageGuide from '@/components/content/PageGuide';
import { pageMetadata } from '@/seo';
import WhatsAppClient from "./WhatsAppClient";

export const metadata = pageMetadata('/whatsapp');

export default function WhatsAppPage() {
  return <WhatsAppClient  contentGuide={<PageGuide page="whatsapp" />} />;
}
