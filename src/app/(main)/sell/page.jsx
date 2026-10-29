import { pageMetadata } from '@/seo';
import SellClient from "./SellClient";

export const metadata = pageMetadata('/sell');

export default function SellPage() {
  return <SellClient />;
}
