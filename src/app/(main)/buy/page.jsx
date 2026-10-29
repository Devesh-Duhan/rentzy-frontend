import { pageMetadata } from '@/seo';
import BuyClient from "./BuyClient";

export const metadata = pageMetadata('/buy');

export default function BuyPage() {
  return <BuyClient />;
}
