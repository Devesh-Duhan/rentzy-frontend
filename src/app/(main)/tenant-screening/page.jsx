import { pageMetadata } from '@/seo';
import TenantScreeningClient from "./TenantScreeningClient";

export const metadata = pageMetadata('/tenant-screening');

export default function TenantScreeningPage() {
  return <TenantScreeningClient />;
}
