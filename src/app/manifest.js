import { LOGO_SRC, LOGO_SIZE } from '@/lib/constants';
import { SITE_SEO } from '@/seo';

export default function manifest() {
  return {
    name: SITE_SEO.name,
    short_name: SITE_SEO.name,
    description: SITE_SEO.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      { src: LOGO_SRC, sizes: LOGO_SIZE, type: "image/png", purpose: "any" },
    ],
  };
}
