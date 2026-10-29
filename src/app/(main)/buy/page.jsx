import { filterMetadata, toSearchParams } from '@/seo/property-seo';
import BuyClient from "./BuyClient";

export async function generateMetadata({ searchParams }) { return filterMetadata('/buy', toSearchParams(await searchParams)); }

export default function BuyPage() {
  return <BuyClient />;
}
