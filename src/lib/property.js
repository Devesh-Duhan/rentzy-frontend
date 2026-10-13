export const propertyType = value => (Array.isArray(value) ? value[0] : value) || 'Property';
export const isSale = value => (Array.isArray(value) ? value : [value]).includes('sell');
export const formatMoney = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const locationLabel = location => typeof location === 'string' ? location : [location?.address, location?.city, location?.state].filter(Boolean).join(', ');
export const cardProperty = property => ({
  ...property, id: property._id || property.id,
  bedrooms: property.bedrooms ?? property.bhk,
  areaSqFt: property.areaSqFt ?? property.area,
  isNew: Boolean(property.createdAt && Date.now() - new Date(property.createdAt).getTime() < 7 * 86400000),
});
export function contactPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}
