import PageGuide from '@/components/content/PageGuide';
import { pageMetadata } from '@/seo';
import TestimonialsClient from "./TestimonialsClient";

export const metadata = pageMetadata('/testimonials');

export default function TestimonialsPage() {
  return <TestimonialsClient  contentGuide={<PageGuide page="testimonials" />} />;
}
