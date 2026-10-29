import { pageMetadata } from '@/seo';
import WishlistClient from "./WishlistClient";

export const metadata = pageMetadata('/wishlist');

export default function WishlistPage() {
  return <WishlistClient />;
}
