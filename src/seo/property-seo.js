import { PROPERTY_SEO, SEARCH_FILTER_KEYS } from './seo.constants.js';
import { buildMetadata, pageMetadata, metadataText, canonicalUrl } from './seo.utils.js';

export const validPropertyId = id => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
export const isPublicListing = property => Boolean(property && validPropertyId(String(property._id || '')) &&
  typeof property.title === 'string' && metadataText(property.title) && property.status === 'available' &&
  property.isVerified === true && property.isPaid !== false && !property.rejectionReason);
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
const shorten = (text, limit) => metadataText(text).slice(0, limit).trim();
const list = value => Array.isArray(value) ? value : value ? [value] : [];

export function propertyMetadata(property, id, state = 'missing') {
  const canonical = `/properties/${String(id).toLowerCase()}`;
  if (!isPublicListing(property) || !validPropertyId(id) || String(property._id).toLowerCase() !== id.toLowerCase()) return buildMetadata({ ...(state === 'error' ? PROPERTY_SEO.failure : PROPERTY_SEO.unavailable), canonical });
  const types = list(property.type).filter(value => typeof value === 'string');
  const type = types.find(value => !['residential', 'commercial', 'industrial'].includes(value)) || types[0];
  const typeName = PROPERTY_SEO.typeLabels[type] || metadataText(type || '').replace(/[-_]/g, ' ');
  const bedrooms = Number.isInteger(property.bedrooms) && property.bedrooms > 0 && PROPERTY_SEO.dwellingTypes.some(value => types.includes(value))
    ? fill(PROPERTY_SEO.bedroom, { count: property.bedrooms }) : '';
  const home = [bedrooms, typeName].filter(Boolean).join(' ') || metadataText(property.title);
  const purposes = list(property.purpose);
  const purposeKey = purposes.includes('rent') && purposes.includes('sell') ? 'both' : purposes.includes('rent') ? 'rent' : purposes.includes('sell') ? 'sell' : '';
  const location = typeof property.location === 'object' && property.location ? property.location : {};
  const city = metadataText(location.city || location.state || location.address || '');
  const values = { home, purpose: PROPERTY_SEO.purpose[purposeKey] || '', location: city ? ` in ${city}` : '' };
  const facts = [
    typeof property.price === 'number' && Number.isFinite(property.price) && property.price >= 0 ? fill(PROPERTY_SEO.price, { price: new Intl.NumberFormat('en-IN').format(property.price) }) : '',
    PROPERTY_SEO.furnishing[property.furnishing],
    [...new Set([location.address, location.city, location.state].map(value => metadataText(value || '')).filter(Boolean))].join(', '),
  ].filter(Boolean).join(' · ');
  const images = list(property.images).filter(value => typeof value === 'string' && /^(https?:\/\/|\/[^/])/.test(value));
  return buildMetadata({
    title: shorten(fill(PROPERTY_SEO.title, values), PROPERTY_SEO.titleLimit),
    description: shorten(fill(PROPERTY_SEO.description, { summary: fill(PROPERTY_SEO.summary, values), facts, title: metadataText(property.title), description: metadataText(property.description || '') }).replace(/\.\s*\./g, '.'), PROPERTY_SEO.descriptionLimit),
    canonical, image: images[0],
    openGraph: images.length ? { images: images.slice(0, 4).map(url => ({ url, alt: metadataText(property.title) })) } : undefined,
  });
}

export function toSearchParams(values = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) for (const item of list(value)) if (typeof item === 'string') params.append(key, item);
  return params;
}
export function searchQuery(params) {
  const filters = Object.fromEntries(SEARCH_FILTER_KEYS.map(key => [key, params.get(key) || '']));
  return new URLSearchParams(Object.entries({ ...filters, sort: params.get('sort') || 'relevance', page: String(parseInt(params.get('page') || '1')) }).filter(([,value]) => value)).toString();
}
export function filterMetadata(route, params) {
  const meaningful = [...params.keys()].some(key => !PROPERTY_SEO.trackingKeys.includes(key));
  const metadata = pageMetadata(route);
  return meaningful ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}
export function listingMetadata(route, params, snapshot) {
  const metadata = filterMetadata(route, params);
  if (!snapshot?.data || snapshot.data.properties.length === 0) return { ...metadata, robots: { index: false, follow: true } };
  return { ...buildMetadata({
    title: metadata.title.absolute, canonical: route,
    description: fill(PROPERTY_SEO.listingDescription, { count: snapshot.data.count, inventory: (snapshot.data.count === 1 ? PROPERTY_SEO.singularInventory : PROPERTY_SEO.inventory).rent }),
    robots: metadata.robots,
  }) };
}
export function locationMetadata(params, snapshot) {
  const fallback = pageMetadata('/search');
  const properties = snapshot?.data?.data || snapshot?.data?.properties || [];
  const requestedCity = metadataText(params.get('city') || '');
  const purpose = params.get('purpose') || '';
  const duplicate = [...new Set(params.keys())].some(key => params.getAll(key).length !== 1);
  const extras = [...params.keys()].some(key => !PROPERTY_SEO.locationKeys.includes(key) && !PROPERTY_SEO.trackingKeys.includes(key));
  const city = metadataText(properties[0]?.location?.city || '');
  const exactInventory = requestedCity && city && requestedCity.toLowerCase() === city.toLowerCase() && properties.length > 0 && properties.every(property =>
    isPublicListing(property) && metadataText(property.location?.city || '').toLowerCase() === city.toLowerCase() && (!purpose || list(property.purpose).includes(purpose)));
  if (!exactInventory || duplicate || extras || !['', 'rent', 'sell'].includes(purpose)) return fallback;
  const inventory = PROPERTY_SEO.inventory[purpose || 'all'];
  const query = new URLSearchParams({ city }); if (purpose) query.set('purpose', purpose);
  // General canonicalUrl intentionally strips query strings; preserve ONLY this explicit finite landing-page policy.
  const canonical = `${canonicalUrl('/search')}?${query}`;
  const metadata = buildMetadata({ title: fill(PROPERTY_SEO.locationTitle, { inventory, city }), description: fill(PROPERTY_SEO.locationDescription, { inventory: (snapshot.data.count === 1 ? PROPERTY_SEO.singularInventory : PROPERTY_SEO.inventory)[purpose || 'all'], city, count: snapshot.data.count }), canonical: '/search' });
  metadata.alternates.canonical = canonical;
  metadata.openGraph.url = canonical;
  return metadata;
}
