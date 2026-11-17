import PageGuide from '@/components/content/PageGuide';
import { pageMetadata } from '@/seo';
import GalleryClient from "./GalleryClient";

export const metadata = pageMetadata('/gallery');

export default function GalleryPage() {
  return <GalleryClient  contentGuide={<PageGuide page="gallery" />} />;
}
