import { SITE_SEO } from '@/seo';
import { BRAND_ASSETS, WEB_APP_BRAND } from '@/lib/brand';

export default function manifest() {
  return {
    name: SITE_SEO.name,
    short_name: SITE_SEO.name,
    description: SITE_SEO.description,
    ...WEB_APP_BRAND,
    icons: BRAND_ASSETS.manifestIcons,
  };
}
