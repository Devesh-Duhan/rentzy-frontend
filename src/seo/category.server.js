import { cache } from 'react';
import { PROPERTY_SEO } from './seo.constants.js';
import { publicCategory, validCategorySlug } from './category-seo.js';
const api = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const getPublicCategory = cache(async slug => {
  if (!validCategorySlug(slug)) return { state: 'missing', category: null };
  try {
    const response = await fetch(`${api}/categories/${encodeURIComponent(slug)}`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(PROPERTY_SEO.fetchTimeout) });
    if ([400,404,410].includes(response.status)) return { state: 'missing', category: null };
    if (!response.ok) return { state: 'error', category: null };
    const category = publicCategory((await response.json())?.data);
    return { state: category ? 'ok' : 'missing', category };
  } catch { return { state: 'error', category: null }; }
});
