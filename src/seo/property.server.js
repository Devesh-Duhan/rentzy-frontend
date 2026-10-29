import { cache } from 'react';
import { PROPERTY_SEO } from './seo.constants.js';
import { isPublicListing, validPropertyId } from './property-seo.js';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
async function read(endpoint) {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, { cache: 'no-store', signal: AbortSignal.timeout(PROPERTY_SEO.fetchTimeout), redirect: 'error' });
    if ([400,404,410].includes(response.status)) return { state: 'missing' };
    if (!response.ok) return { state: 'error' };
    return { state: 'ok', data: await response.json() };
  } catch { return { state: 'error' }; }
}
export const getPublicProperty = cache(async id => {
  if (!validPropertyId(id)) return { state: 'missing', property: null };
  const result = await read(`/properties/${id.toLowerCase()}`);
  const property = result.data;
  if (result.state !== 'ok') return { state: result.state, property: null };
  if (!isPublicListing(property) || String(property._id).toLowerCase() !== id.toLowerCase()) return { state: 'missing', property: null };
  // Never serialize private payment verification/contact fields into the RSC payload.
  const { listingPayment, contactNumber, ...publicProperty } = property;
  void listingPayment; void contactNumber;
  return { state: 'ok', property: publicProperty };
});
export const getPublicListings = cache(async (endpoint, query) => {
  const result = await read(`${endpoint}?${query}`);
  if (result.state !== 'ok') return { state: result.state, data: null };
  const rows = result.data?.properties || result.data?.data;
  const count = result.data?.count;
  if (!Array.isArray(rows) || !Number.isSafeInteger(count) || count < rows.length || rows.some(property => !isPublicListing(property))) return { state: 'error', data: null };
  const clean = rows.map(({ listingPayment, contactNumber, ...property }) => { void listingPayment; void contactNumber; return property; });
  return { state: 'ok', data: { ...result.data, ...(Array.isArray(result.data.properties) ? { properties: clean } : {}), ...(Array.isArray(result.data.data) ? { data: clean } : {}) } };
});
