import { pageMetadata } from '@/seo';
import RentClient from "./RentClient";

export const metadata = pageMetadata('/rent');

export default function RentPage() {
  return <RentClient />;
}
