import { pageMetadata } from '@/seo';
import WhatsAppClient from "./WhatsAppClient";

export const metadata = pageMetadata('/whatsapp');

export default function WhatsAppPage() {
  return <WhatsAppClient />;
}
