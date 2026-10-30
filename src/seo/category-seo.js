import { CATEGORY_SEO } from './seo.constants.js';
import { buildMetadata, metadataText } from './seo.utils.js';
export const validCategorySlug = value => typeof value === 'string' && /^[a-z\d_-]{1,120}$/i.test(value);
export function publicCategory(value) {
  if (!value || value.isActive === false || !metadataText(value.name || '') || !validCategorySlug(value.slug)) return null;
  const fields = ({ _id, name, slug, description, icon, image, metaTitle, metaDescription }) => ({ _id, name, slug, description, icon, image, metaTitle, metaDescription });
  return { ...fields(value), sub: Array.isArray(value.sub) ? value.sub.filter(item => item?.isActive !== false && validCategorySlug(item?.slug)).map(fields) : [] };
}
export function categoryMetadata(category, filtered = false, failed = false) {
  if (!category) return buildMetadata({ ...(failed ? CATEGORY_SEO.failure : CATEGORY_SEO.missing), canonical: '/properties' });
  return buildMetadata({
    title: category.metaTitle || CATEGORY_SEO.title.replace('{name}', metadataText(category.name)),
    description: category.metaDescription || category.description || CATEGORY_SEO.description.replace('{name}', metadataText(category.name)),
    canonical: `/category/${encodeURIComponent(category.slug)}`,
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  });
}
