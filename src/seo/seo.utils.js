import { SITE_SEO, PAGE_SEO, DASHBOARD_SEO, DYNAMIC_SEO } from './seo.constants.js';

// Metadata is text, never HTML. Next.js escapes the resulting strings when rendering tags.
export function metadataText(value = '') {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return String(value).replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, code) => {
    if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? match;
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '';
  }).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function canonicalUrl(path = '/') {
  try {
    const parsed = new URL(path, `${SITE_SEO.baseUrl}/`);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid canonical protocol');
    const pathname = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
    return `${SITE_SEO.baseUrl}${pathname === '/' ? '' : pathname}`;
  } catch { return SITE_SEO.baseUrl; }
}

function imageUrl(value) {
  try {
    const url = new URL(value || SITE_SEO.image, `${SITE_SEO.baseUrl}/`);
    if (['http:', 'https:'].includes(url.protocol)) return url.href;
  } catch { /* Use the site image when a stored image URL is invalid. */ }
  return new URL(SITE_SEO.image, SITE_SEO.baseUrl).href;
}

export function buildMetadata(config = {}) {
  const titleText = metadataText(config.title || SITE_SEO.title);
  const title = titleText.includes(SITE_SEO.name) ? titleText : `${titleText} | ${SITE_SEO.name}`;
  const description = metadataText(config.description || SITE_SEO.description);
  const canonical = config.canonical == null ? undefined : canonicalUrl(config.canonical);
  const image = imageUrl(config.image);
  const og = config.openGraph || {};
  const twitter = config.twitter || {};
  const socialImages = (images) => {
    const list = images == null ? [image] : (Array.isArray(images) ? images : [images]);
    return (list.length ? list : [image]).map(item => typeof item === 'string'
      ? { url: imageUrl(item), alt: SITE_SEO.imageAlt }
      : { ...item, url: imageUrl(item.url), alt: metadataText(item.alt || SITE_SEO.imageAlt) });
  };
  return {
    metadataBase: new URL(SITE_SEO.baseUrl),
    title: { absolute: title }, description,
    keywords: config.keywords ?? SITE_SEO.keywords,
    robots: config.robots ?? SITE_SEO.robots,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      siteName: SITE_SEO.name, locale: SITE_SEO.locale,
      ...og, type: og.type || config.type || SITE_SEO.type,
      title: metadataText(og.title || title), description: metadataText(og.description || description),
      ...(canonical ? { url: canonical } : {}), images: socialImages(og.images),
    },
    twitter: {
      ...twitter, card: twitter.card || SITE_SEO.twitterCard,
      title: metadataText(twitter.title || title), description: metadataText(twitter.description || description),
      images: socialImages(twitter.images),
    },
  };
}

export function pageMetadata(path) {
  const key = new URL(canonicalUrl(path)).pathname;
  if (!PAGE_SEO[key]) throw new Error(`Missing SEO configuration for ${key}`);
  return buildMetadata(PAGE_SEO[key]);
}

export const dashboardMetadata = () => buildMetadata(DASHBOARD_SEO);
export function dynamicMetadata(kind, canonical, overrides = {}) {
  if (!DYNAMIC_SEO[kind]) throw new Error(`Unknown SEO kind: ${kind}`);
  return buildMetadata({ ...DYNAMIC_SEO[kind], ...overrides, canonical });
}
