import { Suspense } from 'react';
import RouteLoading from '@/components/RouteLoading';
import { pageMetadata } from '@/seo';
import CompareClient from "./CompareClient";

export const metadata = pageMetadata('/compare');

export default function ComparePage() {
  return <Suspense fallback={<RouteLoading />}><CompareClient /></Suspense>;
}
