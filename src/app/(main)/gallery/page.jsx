import { pageMetadata } from '@/seo';
import GalleryClient from "./GalleryClient";

export const metadata = pageMetadata('/gallery');

export default function GalleryPage() {
  return <GalleryClient />;
}
